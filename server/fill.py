import sys
import datetime
import random
import json
import sqlite3
from sqlite3 import Error


def create_connection(db_file: str) -> sqlite3.Connection | None:
    conn = None

    try:
        conn = sqlite3.connect(db_file)
        print(sqlite3.version)
    except Error as e:
        print(e)

    return conn


def clean_db(conn: sqlite3.Connection) -> None:
    sql = "DELETE FROM curls"
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()


def insert_into_db(conn: sqlite3.Connection, curl: str, status: str) -> None:
    sql = """ INSERT INTO curls(created, updated, curl, key, status)
              VALUES(?,?,?,?,?) """
    cur = conn.cursor()
    now = (
        date_now()
    )  # assuming date_now() is a function that returns current date and time
    cur.execute(sql, (now, now, curl, "pass", status))
    conn.commit()


def date_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def get_random_items(file: str, num: int) -> list[str]:
    with open(file) as f:
        names = json.load(f)
        return random.sample(names, num)


def clean_items(names: list[str]) -> list[str]:
    clean = []

    for word in names:
        clean.append("".join(filter(str.isalpha, word)))

    clean = [x.lower() for x in clean]
    return clean


if __name__ == "__main__":
    num = 140
    colors = ["red", "green", "blue", "yellow", "purple", "white"]
    names = get_random_items("names.json", num)
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

    with open("export.json", "w") as f:
        json.dump(obj, f, indent=4)

    sents = get_random_items("sentences.json", num)
    conn = create_connection("curls.db")

    if not conn:
        print("Error: Could not connect to database.")
        sys.exit(1)

    with conn:
        clean_db(conn)

        for i, name in enumerate(names):
            insert_into_db(conn, name, sents[i])
