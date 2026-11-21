from __future__ import annotations

# Standard
import json
import os
import string
from pathlib import Path


class MissingCaptchaKeyError(RuntimeError):
    def __init__(self) -> None:
        super().__init__(
            "Missing or weak CAPTCHA secret key. "
            "Set CURLS_CAPTCHA_KEY or create server/captcha_key.txt (min 16 chars)."
        )


base_dir = Path(__file__).resolve().parent

curl_max_length = 20
key_length = 22
status_max_length = 2000
max_curls = 100
max_content_length = 16 * 1024
rate_limit = 20
rate_limit_change = 5
rate_limit_change_per_curl = 5
proxy_count = int(os.environ.get("CURLS_PROXY_COUNT", "1"))
redis_uri = os.environ.get("CURLS_REDIS_URI", "redis://localhost:6379")
min_captcha_key_length = 16
captcha_key = os.environ.get("CURLS_CAPTCHA_KEY", "").strip()
captcha_cheat = ""
text_mtype = "text/plain"
captcha_key_file = base_dir / "captcha_key.txt"
captcha_cheat_file = base_dir / "captcha_cheat.txt"
manifest_file = base_dir / "manifest.json"
manifest = {}

if not captcha_key and captcha_key_file.is_file():
    with captcha_key_file.open("r", encoding="utf-8") as f:
        captcha_key = f.read().strip()

if (
    (not captcha_key)
    or (captcha_key == "changeMe")
    or (len(captcha_key) < min_captcha_key_length)
):
    raise MissingCaptchaKeyError

if captcha_cheat_file.is_file():
    with captcha_cheat_file.open("r", encoding="utf-8") as f:
        captcha_cheat = f.read().strip()

if manifest_file.is_file():
    with manifest_file.open("r", encoding="utf-8") as f:
        manifest = json.loads(f.read().strip())

captcha = {
    "SECRET_CAPTCHA_KEY": captcha_key,
    "CAPTCHA_LENGTH": 9,
    "CAPTCHA_DIGITS": False,
    "EXPIRE_SECONDS": 60,
    "CAPTCHA_IMG_FORMAT": "JPEG",
    "ONLY_UPPERCASE": False,
    "CHARACTER_POOL": string.ascii_lowercase,
}
