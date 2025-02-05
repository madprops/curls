# Standard
import sqlite3
from typing import Any

# Libraries
import click  # type: ignore
from flask import current_app, g  # type: ignore


DATABASE = "curls.db"


def get_db() -> Any:
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES)

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
