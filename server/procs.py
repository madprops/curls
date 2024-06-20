from __future__ import annotations

# Standard
import random
import string
from typing import Any

# Modules
from . import db
from . import config


def do_claim(curl: str) -> str:
    curl = curl.strip().lower()

    if not check_curl(curl):
        return "Error: Invalid curl"

    if curl_exists(curl):
        return "Error: Curl already exists"

    key = make_key()
    add_curl(curl, key)
    return f"Your curl is {curl} and your key is {key}"


def add_curl(curl: str, key: str) -> None:
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "INSERT INTO curls (curl, key, text) VALUES (?, ?, ?)"
    cursor.execute(db_string, (curl, key, ""))
    dbase.commit()


def make_key() -> str:
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for i in range(config.passkey_length))


def check_key(curl: str, key: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT key FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result) and (result[0] == key)


def update_text(curl: str, text: str) -> None:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "UPDATE curls SET text = ?, updated = CURRENT_TIMESTAMP WHERE curl = ?"
    cursor.execute(db_string, (text, curl))
    dbase.commit()


def curl_exists(curl: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT curl FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result)


def get_text(curl: str) -> str:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT text FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return check_text(result)


def get_curl_list(curls: list[str]) -> list[dict[str, Any]]:
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = "SELECT curl, text, updated FROM curls WHERE curl IN ({})".format(
        ",".join("?" * len(curls))
    )

    cursor.execute(db_string, curls)
    results = cursor.fetchall()
    items = []

    for result in results:
        if not result:
            continue

        curl = result[0]
        text = result[1]
        updated = str(result[2]) or ""
        items.append({"curl": curl, "text": text, "updated": updated})

    return items


def check_text(result: Any) -> str:
    if not result:
        return "Not claimed yet"

    text = result[0]

    if not text:
        return "Not updated yet"

    return str(text)


def curl_too_long() -> str:
    return f"Error: Curl is too long (Max is {config.curl_max_length} characters)"


def text_too_long() -> str:
    return f"Error: Text is too long (Max is {config.content_max_length} characters)"


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