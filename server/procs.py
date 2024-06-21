from __future__ import annotations

# Standard
import random
import string
from typing import Any

# Modules
import db
import config


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
    db_string = "INSERT INTO curls (curl, key, status) VALUES (?, ?, ?)"
    cursor.execute(db_string, (curl, key, ""))
    dbase.commit()


def make_key() -> str:
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for i in range(config.key_length))


def check_key(curl: str, key: str) -> bool:
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
    db_string = "UPDATE curls SET status = ?, updated = CURRENT_TIMESTAMP WHERE curl = ?"
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

def check_status (status: str) -> bool:
    if not status:
        return False

    if len(status) > config.status_max_length:
        return False

    return True