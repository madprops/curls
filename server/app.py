from __future__ import annotations

# Standard
from typing import Any

# Libraries
from flask import Flask, render_template, request  # type: ignore
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


@app.route("/", methods=["GET"])  # type: ignore
def index() -> Any:
    return render_template("index.html")


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
def claim() -> Any:
    import procs

    if request.method == "POST":
        return procs.claim_proc(request)

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/edit", methods=["POST", "GET"])  # type: ignore
def edit() -> Any:
    import procs

    if request.method == "POST":
        return procs.edit_proc(request)

    return render_template("edit.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
def dashboard() -> Any:
    return render_template("dashboard.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
def view(curl) -> Any:
    import procs

    return procs.view_proc(curl)


@app.route("/curls", methods=["POST"])  # type: ignore
def get_curls() -> Any:
    import procs

    if request.method == "POST":
        return procs.curls_proc(request)

    return "Invalid request"
