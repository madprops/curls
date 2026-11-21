from __future__ import annotations

# Standard
import sqlite3
from pathlib import Path
from typing import Any

# Libraries
import click  # type: ignore
from flask import current_app, g  # type: ignore


DATABASE = str(Path(__file__).resolve().parent / "curls.db")


def get_db() -> Any:
    if "db" not in g:
        g.db = sqlite3.connect(
            DATABASE,
            timeout=30.0,
            detect_types=sqlite3.PARSE_DECLTYPES,
        )

        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA busy_timeout=30000")
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e: Any) -> None:
    db = g.pop("db", None)

    if db is not None:
        db.close()


@click.command("init-db")  # type: ignore
def init_db_command() -> None:
    init_db()
    click.echo("Initialized the database.")


def init_db() -> None:
    db = get_db()

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))


def init_app(app: Any) -> None:
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
