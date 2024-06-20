from __future__ import annotations

# Standard
import random
import string
import json

# Libraries
from flask import Flask, render_template, request  # type: ignore
from flask_simple_captcha import CAPTCHA  # type: ignore
from flask_cors import CORS  # type: ignore
from typing import Any

# Modules
from . import db


CURL_MAX_LENGTH = 18
PASSKEY_LENGTH = 18
CONTENT_MAX_LENGTH = 500
MAX_CURLS = 100

app = Flask(__name__)

# Enable all cross origin requests
CORS(app)

db.init_app(app)

# Captcha

YOUR_CONFIG = {
    "SECRET_CAPTCHA_KEY": "ChangeMe",
    "CAPTCHA_LENGTH": 10,
    "CAPTCHA_DIGITS": False,
    "EXPIRE_SECONDS": 60,
    "CAPTCHA_IMG_FORMAT": "JPEG",
    "ONLY_UPPERCASE": False,
    "CHARACTER_POOL": string.ascii_lowercase,
}

SIMPLE_CAPTCHA = CAPTCHA(config=YOUR_CONFIG)
app = SIMPLE_CAPTCHA.init_app(app)

# Routes


@app.route("/", methods=["GET"])  # type: ignore
def index() -> Any:
    return render_template("index.html")


@app.route("/claim", methods=["POST", "GET"])  # type: ignore
def claim() -> Any:
    if request.method == "POST":
        c_hash = request.form.get("captcha-hash")
        c_text = request.form.get("captcha-text")

        if not SIMPLE_CAPTCHA.verify(c_text, c_hash):
            return "Failed captcha"

        return do_claim(request.form["curl"])

    captcha = SIMPLE_CAPTCHA.create()
    return render_template("claim.html", captcha=captcha)


@app.route("/edit", methods=["POST", "GET"])  # type: ignore
def edit() -> Any:
    if request.method == "POST":
        curl = request.form.get("curl")
        key = request.form.get("key")
        content = request.form.get("content")

        if not curl or not key or not content:
            return "Error: Empty fields"

        if not check_curl(curl):
            return "Error: Invalid curl"

        if not check_key(curl, key):
            return "Error: Invalid key"

        update_content(curl, content)
        return "ok"

    return render_template("edit.html")


@app.route("/dashboard", methods=["GET"])  # type: ignore
def dashboard() -> Any:
    return render_template("dashboard.html")


@app.route("/<curl>", methods=["GET"])  # type: ignore
def view(curl) -> Any:
    if not check_curl(curl):
        return "Invalid curl"

    return get_content(curl)


@app.route("/curls", methods=["POST"])  # type: ignore
def get_curls() -> Any:
    if request.method == "POST":
        try:
            curls = request.form.getlist("curl")

            if len(curls) > MAX_CURLS:
                return too_many_curls()

            for curl in curls:
                if not check_curl(curl):
                    return "Invalid curl"
        except:
            return "Invalid request"

        results = get_curl_list(curls)
        return json.dumps(results)

    return "Invalid request"


# ---


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
    db_string = "INSERT INTO curls (curl, passkey, content) VALUES (?, ?, ?)"
    cursor.execute(db_string, (curl, key, ""))
    dbase.commit()


def make_key() -> str:
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for i in range(PASSKEY_LENGTH))


def check_key(curl: str, key: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT passkey FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result) and (result[0] == key)


def update_content(curl: str, content: str) -> None:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = (
        "UPDATE curls SET content = ?, updated = CURRENT_TIMESTAMP WHERE curl = ?"
    )

    cursor.execute(db_string, (content, curl))
    dbase.commit()


def curl_exists(curl: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT curl FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return bool(result)


def get_content(curl: str) -> str:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT content FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return check_content(result)


def get_curl_list(curls: list[str]) -> list[dict[str, Any]]:
    dbase = db.get_db()
    cursor = dbase.cursor()

    db_string = "SELECT curl, content, updated FROM curls WHERE curl IN ({})".format(
        ",".join("?" * len(curls))
    )

    cursor.execute(db_string, curls)
    results = cursor.fetchall()
    items = []

    for result in results:
        if not result:
            continue

        curl = result[0]
        content = result[1]
        updated = str(result[2]) or ""
        items.append({"curl": curl, "content": content, "updated": updated})

    return items


def check_content(result: Any) -> str:
    if not result:
        return "Not claimed yet"

    content = result[0]

    if not content:
        return "Not updated yet"

    return str(content)


def curl_too_long() -> str:
    return f"Error: Curl is too long (Max is {CURL_MAX_LENGTH} characters)"


def content_too_long() -> str:
    return f"Error: Content is too long (Max is {CONTENT_MAX_LENGTH} characters)"


def too_many_curls() -> str:
    return f"Error: Too many curls (Max is {MAX_CURLS})"


def check_curl(curl: str) -> bool:
    if not curl:
        return False

    if len(curl) > CURL_MAX_LENGTH:
        return False

    if not curl.isalnum():
        return False

    return True
