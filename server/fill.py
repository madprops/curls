from __future__ import annotations

# Standard
import argparse
import datetime as dt
import json
import os
import random
import sqlite3
import sys
from pathlib import Path
from sqlite3 import Error

# Libraries
from werkzeug.security import generate_password_hash  # type: ignore

# Modules
import utils


base_dir = Path(__file__).resolve().parent


def create_connection(db_file: Path) -> sqlite3.Connection | None:
    conn = None

    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        utils.error(e)

    return conn


def clean_db(conn: sqlite3.Connection) -> None:
    sql = "DELETE FROM curls"
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()


def insert_into_db(
    conn: sqlite3.Connection,
    curl: str,
    status: str,
    key_hash: str,
) -> None:
    sql = """ INSERT INTO curls(created, updated, curl, key, status)
              VALUES(?,?,?,?,?) """

    cur = conn.cursor()
    now = date_now()
    cur.execute(sql, (now, now, curl, key_hash, status))
    conn.commit()


def date_now() -> dt.datetime:
    return dt.datetime.now(dt.UTC)


def get_random_items(file: Path, num: int) -> list[str]:
    with file.open(encoding="utf-8") as f:
        names = json.load(f)
        return random.sample(names, num)


def clean_items(names: list[str]) -> list[str]:
    clean = ["".join(filter(str.isalpha, word)) for word in names]
    return [x.lower() for x in clean]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Wipe curls.db and seed it with development test data."
    )

    parser.add_argument(
        "--force",
        action="store_true",
        help="Required confirmation flag to wipe and re-seed curls.db.",
    )

    args = parser.parse_args()

    # Security: Require both an explicit flag and env opt-in to prevent accidental prod DB wipes.
    if (not args.force) or (os.environ.get("CURLS_ALLOW_SEED") != "1"):
        utils.log("Refusing to wipe curls.db. Run with CURLS_ALLOW_SEED=1 and --force.")
        sys.exit(1)

    num = 140

    colors = [
        "red",
        "green",
        "blue",
        "yellow",
        "orange",
        "pink",
        "gold",
        "silver",
        "bronze",
        "purple",
        "brown",
        "teal",
        "black",
        "white",
        "gray",
    ]

    names = get_random_items(base_dir / "names.json", num)
    names = clean_items(names)

    obj: dict[str, list[str]] = {}
    d = 20
    n1 = 0
    n2 = d

    for color in colors:
        obj[color] = []

        for name in names[n1:n2]:
            obj[color].append(name)

        n1 += d
        n2 += d

    with (base_dir / "export.json").open("w", encoding="utf-8") as f:
        json.dump(obj, f, indent=4)

    sents = get_random_items(base_dir / "sentences.json", num)
    conn = create_connection(base_dir / "curls.db")

    if not conn:
        utils.log("Error: Could not connect to database.")
        sys.exit(1)

    # Hash the dev seed key once so seeded curls pass check_password_hash() verification.
    seed_key_hash = generate_password_hash("pass")

    with conn:
        clean_db(conn)

        for i, name in enumerate(names):
            insert_into_db(conn, name, sents[i], seed_key_hash)
