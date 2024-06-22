# Standard
import json
import string
from pathlib import Path


curl_max_length = 20
key_length = 20
status_max_length = 500
max_curls = 100
captcha_key = "changeMe"
captcha_cheat = ""
captcha_key_file = Path("captcha_key.txt")
captcha_cheat_file = Path("captcha_cheat.txt")
manifest_file = Path("manifest.json")
manifest = {}

if captcha_key_file.is_file():
    with captcha_key_file.open("r") as f:
        captcha_key = f.read().strip()

if captcha_cheat_file.is_file():
    with captcha_cheat_file.open("r") as f:
        captcha_cheat = f.read().strip()

if manifest_file.is_file():
    with manifest_file.open("r") as f:
        manifest = json.loads(f.read().strip())

captcha = {
    "SECRET_CAPTCHA_KEY": captcha_key,
    "CAPTCHA_LENGTH": 10,
    "CAPTCHA_DIGITS": False,
    "EXPIRE_SECONDS": 60,
    "CAPTCHA_IMG_FORMAT": "JPEG",
    "ONLY_UPPERCASE": False,
    "CHARACTER_POOL": string.ascii_lowercase,
}

def get_js_files():
    js_files = Path("static/dashboard").glob("*.js")
    return [str(f) for f in js_files]


def bundle_js():
    js_files = get_js_files()
    order = ["vars.js", "main.js"]
    ignore = ["bundle.js"]

    with open("static/dashboard/bundle.js", "w") as f:
        for o in order:
            with open(f"static/dashboard/{o}", "r") as js:
                f.write(js.read())
                f.write("\n\n")

        for js_file in js_files:
            name = Path(js_file).name

            if name in ignore:
                continue

            if name not in order:
                with open(js_file, "r") as js:
                    print(Path(js_file).name)
                    f.write(js.read())
                    f.write("\n\n")