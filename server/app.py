from __future__ import annotations

# Standard
from typing import Any

# Libraries
from flask import Flask, render_template, request, Response  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_simple_captcha import CAPTCHA  # type: ignore
from flask_limiter import Limiter  # type: ignore
from flask_limiter.util import get_remote_address  # type: ignore

# Modules
import db
import config
import procs
import bundle
import utils


# ---


def rate_limit(n: int) -> str:
    return f"{n} per minute"


app = Flask(__name__)
CORS(app)
db.init_app(app)
simple_captcha = CAPTCHA(config=config.captcha)
app = simple_captcha.init_app(app)
app.url_map.strict_slashes = False


limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[rate_limit(config.rate_limit)],
    storage_uri="redis://localhost:6379",
    strategy="fixed-window",
)


bundle.bundle_dashboard()


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
    return render_template("dashboard.html", version=version)


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def claim() -> Any:
    if request.method == "POST":
        try:
            message = procs.claim_proc(request)
            return render_template("message.html", message=message)
        except Exception as e:
            utils.error(e)
            return Response(invalid, mimetype=config.text_mtype)

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/change", methods=["POST", "GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit_change))  # type: ignore
def change() -> Any:
    if request.method == "POST":
        try:
            ans = procs.change_proc(request)
            return Response(ans, mimetype=config.text_mtype)
        except Exception as e:
            utils.error(e)
            return Response(invalid, mimetype=config.text_mtype)

    return render_template("change.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def get_curl(curl) -> Any:
    try:
        ans = procs.curl_proc(curl)
        return Response(ans, mimetype=config.text_mtype)
    except Exception as e:
        utils.error(e)
        return Response(invalid, mimetype=config.text_mtype)


@app.route("/curls", methods=["POST"])  # type: ignore
@limiter.limit(rate_limit(config.rate_limit))  # type: ignore
def get_curls() -> Any:
    try:
        return procs.curls_proc(request)
    except Exception as e:
        utils.error(e)
        return Response(invalid, mimetype=config.text_mtype)
