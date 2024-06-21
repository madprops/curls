from __future__ import annotations

# Standard
import json
import random
import string
from typing import Any

# Modules
import db
import config


def claim_proc(request: Any) -> str:
    import app

    c_hash = request.form.get("captcha-hash")
    c_text = request.form.get("captcha-text")

    curl = request.form["curl"]
    check_catpcha = True

    if config.captcha_cheat and (c_text == config.captcha_cheat):
        check_catpcha = False

    if check_catpcha:
        if not app.simple_captcha.verify(c_text, c_hash):
            return "Failed captcha"

    curl = curl.strip().lower()

    if not check_curl(curl):
        return "Error: Invalid curl"

    if curl_exists(curl):
        return "Error: Curl already exists"

    key = make_key(curl)
    add_curl(curl, key)

    lines = [
        f"Your curl is: {curl}",
        f"Your key is: {key}",
        "Save the key somewhere so it doesn't get lost",
        "There is no way to recover a lost key",
    ]

    return " - ".join(lines)


def change_proc(request: Any) -> str:
    curl = request.form.get("curl")
    key = request.form.get("key")
    status = request.form.get("status")

    if (not curl) or (not key) or (not status):
        return "Error: Empty fields"

    if not check_curl(curl):
        return "Error: Invalid curl"

    if not check_status(status):
        return "Error: Invalid status"

    if not check_key(curl, key):
        return "Error: Invalid key"

    update_status(curl, status)
    return "ok"


def view_proc(curl: str) -> str:
    if not check_curl(curl):
        return "Invalid curl"

    return get_status(curl)


def curls_proc(request: Any) -> str:
    curls = request.form.getlist("curl")

    if len(curls) > config.max_curls:
        return too_many_curls()

    for curl in curls:
        if not check_curl(curl):
            return "Invalid curl"

    results = get_curl_list(curls)
    return json.dumps(results)


# ---


def add_curl(curl: str, key: str) -> None:
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "INSERT INTO curls (curl, key, status) VALUES (?, ?, ?)"
    cursor.execute(db_string, (curl, key, ""))
    dbase.commit()


def make_key(curl: str) -> str:
    characters = string.ascii_letters + string.digits
    chars = "".join(random.choice(characters) for i in range(config.key_length))
    start = curl[:3]
    rest = len(start) + 1
    return f"{start}_{chars[rest:]}"


def check_key(curl: str, key: str) -> bool:
    if not key:
        return False

    if len(key) > config.key_length:
        return False

    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT key FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result) and (result[0] == key)


def update_status(curl: str, status: str) -> None:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = (
        "UPDATE curls SET status = ?, updated = CURRENT_TIMESTAMP WHERE curl = ?"
    )

    cursor.execute(db_string, (status, curl))
    dbase.commit()


def curl_exists(curl: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT curl FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result)


def get_status(curl: str) -> str:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT status FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return fill_status(result)


def get_curl_list(curls: list[str]) -> list[dict[str, Any]]:
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = "SELECT curl, status, updated FROM curls WHERE curl IN ({})".format(
        ",".join("?" * len(curls))
    )

    cursor.execute(db_string, curls)
    results = cursor.fetchall()
    items = []

    for result in results:
        if not result:
            continue

        curl = result[0]
        status = result[1]
        updated = str(result[2]) or ""
        items.append({"curl": curl, "status": status, "updated": updated})

    return items


def fill_status(result: Any) -> str:
    if not result:
        return "Not claimed yet"

    status = result[0]

    if not status:
        return "Not updated yet"

    return str(status)


def curl_too_long() -> str:
    return f"Error: Curl is too long (Max is {config.curl_max_length} characters)"


def status_too_long() -> str:
    return f"Error: Text is too long (Max is {config.status_max_length} characters)"


def too_many_curls() -> str:
    return f"Error: Too many curls (Max is {config.max_curls})"


def check_curl(curl: str) -> bool:
    if not curl:
        return False

    if len(curl) > config.curl_max_length:
        return False

    if not curl.isalnum():
        return False

    return True


def check_status(status: str) -> bool:
    if not status:
        return False

    if len(status) > config.status_max_length:
        return False

    return True
