from __future__ import annotations

# Standard
from typing import Any

# Libraries
from flask import Flask, render_template, request, Response  # type: ignore
from flask_cors import cross_origin  # type: ignore
from flask_simple_captcha import CAPTCHA  # type: ignore
from flask_limiter import Limiter  # type: ignore
from flask_limiter.util import get_remote_address  # type: ignore
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge  # type: ignore
from werkzeug.middleware.proxy_fix import ProxyFix  # type: ignore

# Modules
import db
import config
import curls
import procs
import bundle
import utils


# ---


def rate_limit(n: int) -> str:
    return f"{n} per minute"


def change_curl_key() -> str:
    # Security: Rate-limit POST /change per target curl to slow distributed key brute-force.
    # Avoid parsing oversized bodies here; if key_func raises RequestEntityTooLarge,
    # Flask-Limiter treats it as a storage failure and trips into fallback mode.
    if (
        request.content_length is not None
        and request.content_length > config.max_content_length
    ):
        return get_remote_address()

    try:
        curl = curls.clean_curl(request.form.get("curl", ""))
    except RequestEntityTooLarge:
        return get_remote_address()

    return f"change-curl:{curl}" if curl else get_remote_address()


app = Flask(__name__)
# Security: Cap request body size before form parsing to prevent memory exhaustion DoS.
app.config["MAX_CONTENT_LENGTH"] = config.max_content_length

if config.proxy_count > 0:
    # Security: Resolve real client IPs behind trusted reverse proxies so rate limits do not
    # collapse into a single 127.0.0.1 bucket. Set CURLS_PROXY_COUNT=0 without a proxy so
    # clients cannot spoof X-Forwarded-For.
    app.wsgi_app = ProxyFix(  # type: ignore
        app.wsgi_app,
        x_for=config.proxy_count,
        x_proto=config.proxy_count,
        x_host=config.proxy_count,
    )

db.init_app(app)
simple_captcha = CAPTCHA(config=config.captcha)
app = simple_captcha.init_app(app)
# Store on app.extensions so procs.py can access it via current_app without circular imports.
app.extensions["simple_captcha"] = simple_captcha
app.url_map.strict_slashes = False


# Security: moving-window prevents 2x bursts across minute boundaries, and the
# in-memory fallback keeps rate limits enforced if Redis becomes unreachable.
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[rate_limit(config.rate_limit)],
    storage_uri=config.redis_uri,
    strategy="moving-window",
    in_memory_fallback_enabled=True,
)


# Only rebuilds bundles if missing or stale, avoiding multi-worker startup races.
bundle.ensure_bundles()


@app.after_request  # type: ignore
def add_security_headers(response: Response) -> Response:
    # Security: Baseline hardening against MIME sniffing, clickjacking, and referrer leaks.
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")

    if request.endpoint == "get_curl":
        # Security: /<curl> serves untrusted user text on the app's origin; sandbox it strictly.
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'none'; sandbox",
        )
    else:
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; "
            "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        )

    if request.endpoint in {"claim", "change"}:
        # Security: Prevent browsers or proxies from caching one-time keys or form submissions.
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"

    return response


# ---


invalid = "Error: Invalid request"


@app.route("/", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def index() -> Any:
    return render_template("index.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def dashboard() -> Any:
    version = config.manifest.get("version", "0.0.0")

    return render_template(
        "dashboard.html",
        version=version,
        status_max_length=config.status_max_length,
    )


# Security: /claim intentionally omits CORS so third-party origins cannot read newly issued keys.
@app.route("/claim", methods=["POST", "GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def claim() -> Any:
    if request.method == "POST":
        try:
            result, status = procs.claim_proc(request)
            return render_template("message.html", **result), status
        except HTTPException:
            # Let Werkzeug HTTP errors (e.g. 413 RequestEntityTooLarge) propagate intact.
            raise
        except Exception as e:
            utils.error(e)
            return Response(invalid, status=500, mimetype=config.text_mtype)

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


# Security: CORS is scoped to public API routes (send_wildcard emits '*' instead of reflecting
# Origin). Stacked IP and per-curl limits throttle both single-IP and distributed key guessing.
@app.route("/change", methods=["POST", "GET"])  # type: ignore
@cross_origin(methods=["POST"], send_wildcard=True)  # type: ignore
@limiter.limit(rate_limit(config.rate_limit_change))  # type: ignore
@limiter.limit(
    rate_limit(config.rate_limit_change_per_curl),
    key_func=change_curl_key,
    methods=["POST"],
)  # type: ignore
def change() -> Any:
    if request.method == "POST":
        try:
            ans, status = procs.change_proc(request)
            return Response(ans, status=status, mimetype=config.text_mtype)
        except HTTPException:
            raise
        except Exception as e:
            utils.error(e)
            return Response(invalid, status=500, mimetype=config.text_mtype)

    return render_template("change.html")


# Public read endpoint; wildcard CORS is intentional so external apps can fetch statuses.
@app.route("/<curl>", methods=["GET"])  # type: ignore
@cross_origin(methods=["GET"], send_wildcard=True)  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def get_curl(curl: str) -> Any:
    try:
        ans, status = procs.curl_proc(curl)
        return Response(ans, status=status, mimetype=config.text_mtype)
    except HTTPException:
        raise
    except Exception as e:
        utils.error(e)
        return Response(invalid, status=500, mimetype=config.text_mtype)


# Public batch read endpoint used by the dashboard and external clients.
@app.route("/curls", methods=["POST"])  # type: ignore
@cross_origin(methods=["POST"], send_wildcard=True)  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def get_curls() -> Any:
    try:
        return procs.curls_proc(request)
    except HTTPException:
        raise
    except Exception as e:
        utils.error(e)
        return Response(invalid, status=500, mimetype=config.text_mtype)
