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

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/claim", methods=["POST", "GET"])
def claim():
    if request.method == "POST":
        c_hash = request.form.get("captcha-hash")
        c_text = request.form.get("captcha-text")

        if not SIMPLE_CAPTCHA.verify(c_text, c_hash):
            return "Failed captcha."

        return do_claim(request.form["curl"])
    else:
        captcha = SIMPLE_CAPTCHA.create()
        return render_template("claim.html", captcha=captcha)

@app.route("/edit", methods=["POST", "GET"])
def edit():
    if request.method == "POST":
        curl = request.form.get("curl")
        passkey = request.form.get("passkey")
        content = request.form.get("content")

        if not curl or not passkey or not content:
            return "Error: Empty fields"

        if len(content) > CONTENT_MAX_LENGTH:
            return f"Error: Content too long (Max is {CONTENT_MAX_LENGTH} characters)"

        if not check_passkey(curl, passkey):
            return "Error: Invalid passkey"

        update_content(curl, content)
        return "ok"
    else:
        return render_template("edit.html")

@app.route("/dashboard", methods=["GET"])
def dashboard():
    return render_template("dashboard.html")

@app.route("/<curl>", methods=["GET"])
def view(curl):
    return get_content(curl)

@app.route("/<curl>/full", methods=["GET"])
def get_full(curl):
    ans = get_full(curl)
    return json.dumps(ans)

@app.route("/curls", methods=["POST"])
def get_curls():
    if request.method == "POST":
        try:
            data = request.get_json()
            curls = data['curls']
        except:
            return "Invalid request."

        results = get_curls(curls)
        return json.dumps(results)
    else:
        return "Invalid request."

# ---

def do_claim(curl: str) -> str:
    curl = curl.strip().lower()

    if not curl:
        return "Empty curl."

    if not curl.isalnum():
        return "Curl must be alphanumeric"

    if len(curl) > CURL_MAX_LENGTH:
        return f"The curl is too long (Max is {CURL_MAX_LENGTH} characters)"

    if curl_exists(curl):
        return "Curl already exists."

    passkey = make_passkey()
    add_curl(curl, passkey)
    return f"Your curl is {curl} and your key is {passkey}"

def add_curl(curl: str, passkey: str) -> None:
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "INSERT INTO curls (curl, passkey, content) VALUES (?, ?, ?)"
    cursor.execute(db_string, (curl, passkey, ""))
    dbase.commit()

def make_passkey() -> str:
    characters = string.ascii_letters + string.digits
    passkey = "".join(random.choice(characters) for i in range(PASSKEY_LENGTH))
    return passkey

def check_passkey(curl: str, passkey: str) -> bool:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT passkey FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    return result and result[0] == passkey

def update_content(curl: str, content: str) -> None:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "UPDATE curls SET content = ?, updated = CURRENT_TIMESTAMP WHERE curl = ?"
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

def get_full(curl: str) -> dict[str, Any]:
    curl = curl.strip().lower()
    dbase = db.get_db()
    cursor = dbase.cursor()
    db_string = "SELECT content, updated FROM curls WHERE curl = ?"
    cursor.execute(db_string, (curl,))
    result = cursor.fetchone()
    content = check_content(result)
    updated = str(result[1]) or ""
    exists = bool(result)

    return {
        "curl": curl,
        "content": content,
        "updated": updated,
        "exists": exists,
    }

def get_curls(curls: list[str]) -> list[dict[str, Any]]:
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
        return "Not claimed yet."

    content = result[0]

    if not content:
        return "Not updated yet."

    return content