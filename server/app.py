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
import procs
import config
import db


# ---


app = Flask(__name__)

# Enable all cross origin requests
CORS(app)

db.init_app(app)

simple_captcha = CAPTCHA(config=config.captcha)
app = simple_captcha.init_app(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["10 per minute"],
    storage_uri="memory://",
    strategy="fixed-window",
)

config.bundle_js()


# ---


invalid = "Invalid request"


@app.route("/", methods=["GET"])  # type: ignore
@limiter.limit("10 per minute")
def index() -> Any:
    return render_template("index.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
@limiter.limit("10 per minute")
def dashboard() -> Any:
    version = config.manifest.get("version", "0.0.0")
    return render_template("dashboard.html", version=version)


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
@limiter.limit("10 per minute")
def claim() -> Any:
    if request.method == "POST":
        try:
            return procs.claim_proc(request)
        except Exception:
            return invalid

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/change", methods=["POST", "GET"])  # type: ignore
@limiter.limit("10 per minute")
def change() -> Any:
    if request.method == "POST":
        try:
            return procs.change_proc(request)
        except Exception:
            return invalid

    return render_template("change.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
@limiter.limit("10 per minute")
def get_curl(curl) -> Any:
    try:
        text = procs.curl_proc(curl)
        return Response(text, mimetype="text/plain")
    except Exception:
        return invalid


@app.route("/curls", methods=["POST"])  # type: ignore
@limiter.limit("10 per minute")
def get_curls() -> Any:
    try:
        return procs.curls_proc(request)
    except Exception:
        return invalid
