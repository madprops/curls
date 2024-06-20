from __future__ import annotations

# Standard
import json
from typing import Any

# Libraries
from flask import Flask, render_template, request  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_simple_captcha import CAPTCHA  # type: ignore

# Modules
from . import config
from . import db


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
    from . import procs

    if request.method == "POST":
        c_hash = request.form.get("captcha-hash")
        c_text = request.form.get("captcha-text")

        if config.captcha_cheat and (c_text != config.captcha_cheat):
            if not simple_captcha.verify(c_text, c_hash):
                return "Failed captcha"

        return procs.do_claim(request.form["curl"])

    captcha = simple_captcha.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/edit", methods=["POST", "GET"])  # type: ignore
def edit() -> Any:
    from . import procs

    if request.method == "POST":
        curl = request.form.get("curl")
        key = request.form.get("key")
        status = request.form.get("status")

        if not curl or not key or not status:
            return "Error: Empty fields"

        if not procs.check_curl(curl):
            return "Error: Invalid curl"

        if not procs.check_key(curl, key):
            return "Error: Invalid key"

        procs.update_status(curl, status)
        return "ok"

    return render_template("edit.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
def dashboard() -> Any:
    return render_template("dashboard.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
def view(curl) -> Any:
    from . import procs

    if not procs.check_curl(curl):
        return "Invalid curl"

    return procs.get_status(curl)


@app.route("/curls", methods=["POST"])  # type: ignore
def get_curls() -> Any:
    from . import procs

    if request.method == "POST":
        try:
            curls = request.form.getlist("curl")

            if len(curls) > config.max_curls:
                return procs.too_many_curls()

            for curl in curls:
                if not procs.check_curl(curl):
                    return "Invalid curl"
        except:
            return "Invalid request"

        results = procs.get_curl_list(curls)
        return json.dumps(results)

    return "Invalid request"
