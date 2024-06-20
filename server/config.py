# Standard
import string


curl_max_length = 18
passkey_length = 18
content_max_length = 500
max_curls = 100

captcha = {
    "SECRET_CAPTCHA_KEY": "ChangeMe",
    "CAPTCHA_LENGTH": 10,
    "CAPTCHA_DIGITS": False,
    "EXPIRE_SECONDS": 60,
    "CAPTCHA_IMG_FORMAT": "JPEG",
    "ONLY_UPPERCASE": False,
    "CHARACTER_POOL": string.ascii_lowercase,
}
