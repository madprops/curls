from __future__ import annotations

# Standard
import hashlib
import hmac
import threading
import time
from typing import Any

# Libraries
import redis  # type: ignore
from flask import jsonify, Response  # type: ignore

# Modules
import app
import config
import curls


invalid_curl = "Error: Invalid curl"
invalid_key = "Error: Invalid key"
invalid_status = "Error: Invalid status"

captcha_lock = threading.Lock()
used_captchas: dict[str, float] = {}
redis_client: Any = None


def get_redis_client() -> Any:
    global redis_client  # noqa: PLW0603

    if not config.redis_uri.startswith(("redis://", "rediss://")):
        return None

    if redis_client is None:
        redis_client = redis.Redis.from_url(
            config.redis_uri,
            socket_connect_timeout=1,
            socket_timeout=1,
        )

    return redis_client


def claim_captcha_token(c_text: str, c_hash: str) -> bool:
    token = c_text if len(c_text.split(".")) == 3 else c_hash
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    ttl = int(config.captcha.get("EXPIRE_SECONDS", 60)) + 5

    client = get_redis_client()

    if client is not None:
        try:
            return bool(client.set(f"curls:captcha:{digest}", "1", nx=True, ex=ttl))
        except redis.RedisError:
            pass

    now = time.monotonic()

    with captcha_lock:
        expired = [k for k, exp in used_captchas.items() if exp <= now]

        for k in expired:
            del used_captchas[k]

        if digest in used_captchas:
            return False

        used_captchas[digest] = now + ttl
        return True


def claim_proc(request: Any) -> dict[str, str]:
    c_hash = request.form.get("captcha-hash", "")
    c_text = request.form.get("captcha-text", "")
    curl = curls.clean_curl(request.form.get("curl", ""))

    check_captcha = True

    if (
        app.app.debug
        and config.captcha_cheat
        and hmac.compare_digest(c_text, config.captcha_cheat)
    ):
        check_captcha = False

    if check_captcha:
        verified = bool(app.simple_captcha.verify(c_text, c_hash))
        app.simple_captcha.verified_captchas.clear()

        if (not verified) or (not claim_captcha_token(c_text, c_hash)):
            return {"error": "Error: Failed captcha"}

    if not curls.check_curl(curl):
        return {"error": invalid_curl}

    key = curls.make_key()

    if not curls.add_curl(curl, key):
        return {"error": "Error: Curl already exists"}

    return {"curl": curl, "key": key}


def change_proc(request: Any) -> str:
    curl = curls.clean_curl(request.form.get("curl", ""))
    key = curls.clean_key(request.form.get("key", ""))
    status = curls.clean_status(request.form.get("status", ""))

    if (not curl) or (not key) or (not status):
        return "Error: Empty fields"

    if not curls.check_curl(curl):
        return invalid_curl

    if not curls.check_status(status):
        return invalid_status

    if not curls.check_key(curl, key):
        return invalid_key

    curls.change_status(curl, status)
    return "ok"


def curl_proc(curl: str) -> str:
    if not curls.check_curl(curl):
        return invalid_curl

    return curls.get_status(curl)


def curls_proc(request: Any) -> Any:
    items = request.form.getlist("curl")

    if len(items) > config.max_curls:
        ans = curls.too_many_curls()
        return Response(ans, mimetype=config.text_mtype)

    for curl in items:
        if not curls.check_curl(curl):
            ans = invalid_curl
            return Response(ans, mimetype=config.text_mtype)

    results = curls.get_curl_list(items)
    return jsonify(results)
