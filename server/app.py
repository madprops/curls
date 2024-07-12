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
import db as DB
import config as Config
import procs as Procs
import bundle as Bundle


# ---


app = Flask(__name__)

# Enable all cross origin requests
CORS(app)

DB.init_app(app)

simple_captcha = CAPTCHA(config=Config.captcha)
app = simple_captcha.init_app(app)
rate_limit = f"{Config.rate_limit} per minute"
rate_limit_change = f"{Config.rate_limit_change} per minute"

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[rate_limit],
    storage_uri="redis://localhost:6379",
    strategy="fixed-window",
)

Bundle.bundle_dashboard()


# ---


invalid = "Error: Invalid request"


@app.route("/", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit)  # type: ignore
def index() -> Any:
    return render_template("index.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit)  # type: ignore
def dashboard() -> Any:
    version = Config.manifest.get("version", "0.0.0")
    return render_template("dashboard.html", version=version)


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
@limiter.limit(rate_limit)  # type: ignore
def claim() -> Any:
    if request.method == "POST":
        try:
            message = Procs.claim_proc(request)
            return render_template("message.html", message=message)
        except Exception as e:
            print(e)
            return Response(invalid, mimetype=Config.text_mtype)

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/change", methods=["POST", "GET"])  # type: ignore
@limiter.limit(rate_limit_change)  # type: ignore
def change() -> Any:
    if request.method == "POST":
        try:
            ans = Procs.change_proc(request)
            return Response(ans, mimetype=Config.text_mtype)
        except Exception as e:
            print(e)
            return Response(invalid, mimetype=Config.text_mtype)

    return render_template("change.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
@limiter.limit(rate_limit)  # type: ignore
def get_curl(curl) -> Any:
    try:
        ans = Procs.curl_proc(curl)
        return Response(ans, mimetype=Config.text_mtype)
    except Exception as e:
        print(e)
        return Response(invalid, mimetype=Config.text_mtype)


@app.route("/curls", methods=["POST"])  # type: ignore
@limiter.limit(rate_limit)  # type: ignore
def get_curls() -> Any:
    try:
        return Procs.curls_proc(request)
    except Exception as e:
        print(e)
        return Response(invalid, mimetype=Config.text_mtype)
