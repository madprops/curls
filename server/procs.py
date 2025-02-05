from __future__ import annotations

# Standard
from flask import jsonify, Response  # type: ignore
from typing import Any

# Modules
import app
import config
import curls


invalid_curl = "Error: Invalid curl"
invalid_key = "Error: Invalid key"
invalid_status = "Error: Invalid status"


def claim_proc(request: Any) -> str:
    c_hash = request.form.get("captcha-hash", "")
    c_text = request.form.get("captcha-text", "")
    curl = curls.clean_curl(request.form.get("curl", ""))

    check_catpcha = True

    if config.captcha_cheat and (c_text == config.captcha_cheat):
        check_catpcha = False

    if check_catpcha:
        if not app.simple_captcha.verify(c_text, c_hash):
            return "Error: Failed captcha"

    if not curls.check_curl(curl):
        return invalid_curl

    if curls.curl_exists(curl):
        return "Error: Curl already exists"

    key = curls.make_key(curl)
    curls.add_curl(curl, key)

    lines = [
        f"Your curl is: <b>{curl}</b>",
        f"Your key is: <b>{key}</b>",
        "The key is secret and shouldn't be shared.",
        "Save the key somewhere so it doesn't get lost.",
        "There is no way to recover a lost key.",
    ]

    return "<br>".join(lines)


def change_proc(request: Any) -> str:
    curl = curls.clean_curl(request.form.get("curl", ""))
    key = curls.clean_key(request.form.get("key", ""))
    status = curls.clean_status(request.form.get("status", ""))

    if (not curl) or (not key) or (not status):
        return "Error: Empty fields"

    if not curls.check_curl(curl):
        return invalid_curl

    if not curls.check_status(status):
        return invalid_status

    if not curls.check_key(curl, key):
        return invalid_key

    curls.change_status(curl, status)
    return "ok"


def curl_proc(curl: str) -> str:
    if not curls.check_curl(curl):
        return invalid_curl

    return curls.get_status(curl)


def curls_proc(request: Any) -> Any:
    items = request.form.getlist("curl")

    if len(items) > config.max_curls:
        ans = curls.too_many_curls()
        return Response(ans, mimetype=config.text_mtype)

    for curl in items:
        if not curls.check_curl(curl):
            ans = invalid_curl
            return Response(ans, mimetype=config.text_mtype)

    results = curls.get_curl_list(items)
    return jsonify(results)
