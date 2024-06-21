from __future__ import annotations

# Standard
from typing import Any

# Libraries
from flask import Flask, render_template, request, Response  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_simple_captcha import CAPTCHA  # type: ignore

# Modules
import config
import db


# ---


app = Flask(__name__)

# Enable all cross origin requests
CORS(app)

db.init_app(app)

simple_captcha = CAPTCHA(config=config.captcha)
app = simple_captcha.init_app(app)


# ---


invalid = "Invalid request"


@app.route("/", methods=["GET"])  # type: ignore
def index() -> Any:
    return render_template("index.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
def dashboard() -> Any:
    version = config.manifest.get("version", "0.0.0")
    return render_template("dashboard.html", version=version)


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
def claim() -> Any:
    import procs

    if request.method == "POST":
        try:
            return procs.claim_proc(request)
        except Exception:
            return invalid

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/change", methods=["POST", "GET"])  # type: ignore
def change() -> Any:
    import procs

    if request.method == "POST":
        try:
            return procs.change_proc(request)
        except Exception:
            return invalid

    return render_template("change.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
def view(curl) -> Any:
    import procs

    try:
        text = procs.view_proc(curl)
        return Response(text, mimetype="text/plain")
    except Exception:
        return invalid


@app.route("/curls", methods=["POST"])  # type: ignore
def get_curls() -> Any:
    import procs

    try:
        return procs.curls_proc(request)
    except Exception:
        return invalid
