from __future__ import annotations

# Standard
from flask import jsonify, Response  # type: ignore
from typing import Any

# Modules
import config as Config
import app as App
import curls as Curls


invalid_curl = "Error: Invalid curl"
invalid_key = "Error: Invalid key"
invalid_status = "Error: Invalid status"


def claim_proc(request: Any) -> str:
    c_hash = request.form.get("captcha-hash", "")
    c_text = request.form.get("captcha-text", "")
    curl = Curls.clean_curl(request.form.get("curl", ""))

    check_catpcha = True

    if Config.captcha_cheat and (c_text == Config.captcha_cheat):
        check_catpcha = False

    if check_catpcha:
        if not App.simple_captcha.verify(c_text, c_hash):
            return "Error: Failed captcha"

    if not Curls.check_curl(curl):
        return invalid_curl

    if Curls.curl_exists(curl):
        return "Error: Curl already exists"

    key = Curls.make_key(curl)
    Curls.add_curl(curl, key)

    lines = [
        f"Your curl is: <b>{curl}</b>",
        f"Your key is: <b>{key}</b>",
        "The key is secret and shouldn't be shared.",
        "Save the key somewhere so it doesn't get lost.",
        "There is no way to recover a lost key.",
    ]

    return "<br>".join(lines)


def change_proc(request: Any) -> str:
    curl = Curls.clean_curl(request.form.get("curl", ""))
    key = Curls.clean_key(request.form.get("key", ""))
    status = Curls.clean_status(request.form.get("status", ""))

    if (not curl) or (not key) or (not status):
        return "Error: Empty fields"

    if not Curls.check_curl(curl):
        return invalid_curl

    if not Curls.check_status(status):
        return invalid_status

    if not Curls.check_key(curl, key):
        return invalid_key

    Curls.change_status(curl, status)
    return "ok"


def curl_proc(curl: str) -> str:
    if not Curls.check_curl(curl):
        return invalid_curl

    return Curls.get_status(curl)


def curls_proc(request: Any) -> Any:
    curls = request.form.getlist("curl")

    if len(curls) > Config.max_curls:
        ans = Curls.too_many_curls()
        return Response(ans, mimetype=Config.text_mtype)

    for curl in curls:
        if not Curls.check_curl(curl):
            ans = invalid_curl
            return Response(ans, mimetype=Config.text_mtype)

    results = Curls.get_curl_list(curls)
    return jsonify(results)
