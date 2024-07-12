from __future__ import annotations

# Standard
import random
import string
import datetime
from typing import Any

# Modules
import db as DB
import config as Config


def get_value(curl: str, what: str) -> Any:
    dbase = DB.get_db()
    cursor = dbase.cursor()
    db_string = f"SELECT {what} FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    return cursor.fetchone()


def add_curl(curl: str, key: str) -> None:
    dbase = DB.get_db()
    cursor = dbase.cursor()

    db_string = """
    INSERT INTO curls (created, updated, curl, key, status)
    VALUES (?, ?, ?, ?, ?)
    """

    now = date_now()
    cursor.execute(db_string, (now, now, curl, key, ""))
    dbase.commit()


def make_key(curl: str) -> str:
    characters = string.ascii_letters + string.digits
    chars = "".join(random.choice(characters) for i in range(Config.key_length))
    start = curl[:3]
    rest = len(start) + 1
    return f"{start}_{chars[rest:]}"


def check_key(curl: str, key: str) -> bool:
    if not key:
        return False

    if len(key) > Config.key_length:
        return False

    result = get_value(curl, "key")
    return bool(result) and (result[0] == key)


def change_status(curl: str, status: str) -> None:
    current = get_status(curl, False)

    if current and (current == status):
        return

    dbase = DB.get_db()
    cursor = dbase.cursor()

    db_string = """
    UPDATE curls
    SET status = ?, updated = ?, changes = changes + 1
    WHERE curl = ?
    """

    now = date_now()
    cursor.execute(db_string, (status, now, curl))
    dbase.commit()


def curl_exists(curl: str) -> bool:
    result = get_value(curl, "curl")
    return bool(result)


def get_status(curl: str, fill: bool = True) -> str:
    result = get_value(curl, "status")

    if fill:
        return fill_status(result)

    if result:
        return str(result[0])

    return ""


def get_curl_list(curls: list[str]) -> list[dict[str, Any]]:
    dbase = DB.get_db()
    cursor = dbase.cursor()

    db_string = """
    SELECT created, curl, status, updated, changes
    FROM curls
    WHERE curl IN ({})
    """.format(",".join("?" * len(curls)))

    cursor.execute(db_string, curls)
    results = cursor.fetchall()
    items = []

    for result in results:
        if not result:
            continue

        created = str(result[0]) or ""
        curl = result[1]
        status = result[2]
        updated = str(result[3]) or ""
        changes = result[4] or 0

        items.append(
            {
                "created": created,
                "curl": curl,
                "status": status,
                "updated": updated,
                "changes": changes,
            }
        )

    return items


def fill_status(result: Any) -> str:
    if not result:
        return "Not claimed yet"

    status = result[0]

    if not status:
        return "Not updated yet"

    return str(status)


def curl_too_long() -> str:
    return f"Error: Curl is too long (Max is {Config.curl_max_length} characters)"


def status_too_long() -> str:
    return f"Error: Text is too long (Max is {Config.status_max_length} characters)"


def too_many_curls() -> str:
    return f"Error: Too many curls (Max is {Config.max_curls})"


def check_curl(curl: str) -> bool:
    if not curl:
        return False

    if len(curl) > Config.curl_max_length:
        return False

    if not curl.isalnum():
        return False

    return True


def check_status(status: str) -> bool:
    if not status:
        return False

    if len(status) > Config.status_max_length:
        return False

    return True


def date_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def clean_curl(curl: str) -> str:
    return str(curl).strip().lower()


def clean_key(key: str) -> str:
    return str(key).strip()


def clean_status(status: str) -> str:
    return str(status).strip()
