from __future__ import annotations

# Standard
import datetime
import re
import secrets
import sqlite3
import string
from typing import Any

# Libraries
from werkzeug.security import check_password_hash, generate_password_hash  # type: ignore

# Modules
import db
import config


CURL_RE = re.compile(r"^[a-z0-9]+$")

ALLOWED_COLUMNS = frozenset(
    {"id", "created", "updated", "curl", "key", "status", "changes"}
)

RESERVED_CURLS = frozenset(
    {
        "dashboard",
        "claim",
        "change",
        "curls",
        "static",
        "favicon",
        "robots",
        "sitemap",
    }
)


class InvalidColumnError(ValueError):
    def __init__(self, column: str) -> None:
        super().__init__(f"Invalid column name: {column}")


def get_value(curl: str, what: str) -> Any:
    if what not in ALLOWED_COLUMNS:
        raise InvalidColumnError(what)

    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = f"SELECT {what} FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    return cursor.fetchone()


def add_curl(curl: str, key: str) -> bool:
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = """
    INSERT INTO curls (created, updated, curl, key, status)
    VALUES (?, ?, ?, ?, ?)
    """

    now = date_now()
    key_hash = generate_password_hash(key)

    try:
        cursor.execute(db_string, (now, now, curl, key_hash, ""))
        dbase.commit()
    except sqlite3.IntegrityError:
        dbase.rollback()
        return False

    return True


def make_key() -> str:
    characters = string.ascii_letters + string.digits
    return "".join(secrets.choice(characters) for _ in range(config.key_length))


def check_key(curl: str, key: str) -> bool:
    if not key:
        return False

    if len(key) > config.key_length:
        return False

    result = get_value(curl, "key")

    if not result:
        return False

    return bool(check_password_hash(str(result[0]), key))


def change_status(curl: str, status: str) -> None:
    current = get_status(curl, False)

    if current and (current == status):
        return

    dbase = db.get_db()
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
    dbase = db.get_db()
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

    if curl in RESERVED_CURLS:
        return False

    return bool(CURL_RE.fullmatch(curl))


def check_status(status: str) -> bool:
    if not status:
        return False

    return len(status) <= config.status_max_length


def date_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def clean_curl(curl: str) -> str:
    return str(curl).strip().lower()


def clean_key(key: str) -> str:
    return str(key).strip()


def clean_status(status: str) -> str:
    return str(status).strip()
