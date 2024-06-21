# Standard
import json
import string
from pathlib import Path


curl_max_length = 18
key_length = 18
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
