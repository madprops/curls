# Standard
import sqlite3

# Libraries
import click  # type: ignore
from flask import current_app, g  # type: ignore


DATABASE = "curls.db"

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            DATABASE,
            detect_types=sqlite3.PARSE_DECLTYPES
        )

        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):
    db = g.pop("db", None)

    if db is not None:
        db.close()


@click.command("init-db")
def init_db_command():
    init_db()
    click.echo("Initialized the database.")


def init_db():
    db = get_db()

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)