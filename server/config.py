# Standard
import os
import string


curl_max_length = 18
key_length = 18
status_max_length = 500
max_curls = 100
captcha_key = "changeMe"
captcha_cheat = ""

if os.path.isfile("captcha_key.txt"):
    with open("captcha_key.txt", "r") as f:
        captcha_key = f.read().strip()

if os.path.isfile("captcha_cheat.txt"):
    with open("captcha_cheat.txt", "r") as f:
        captcha_cheat = f.read().strip()

captcha = {
    "SECRET_CAPTCHA_KEY": captcha_key,
    "CAPTCHA_LENGTH": 10,
    "CAPTCHA_DIGITS": False,
    "EXPIRE_SECONDS": 60,
    "CAPTCHA_IMG_FORMAT": "JPEG",
    "ONLY_UPPERCASE": False,
    "CHARACTER_POOL": string.ascii_lowercase,
}
