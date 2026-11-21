from __future__ import annotations

# Standard
import hashlib
import hmac
import threading
import time
from typing import Any

# Libraries
import redis  # type: ignore
from flask import current_app, jsonify, Response  # type: ignore

# Modules
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
    expire = config.captcha.get("EXPIRE_SECONDS", 60)
    ttl = (expire if isinstance(expire, int) else 60) + 5

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


def claim_proc(request: Any) -> tuple[dict[str, str], int]:
    c_hash = request.form.get("captcha-hash", "")
    c_text = request.form.get("captcha-text", "")
    curl = curls.clean_curl(request.form.get("curl", ""))

    check_captcha = True

    if (
        current_app.debug
        and config.captcha_cheat
        and hmac.compare_digest(c_text, config.captcha_cheat)
    ):
        check_captcha = False

    if check_captcha:
        simple_captcha = current_app.extensions["simple_captcha"]
        verified = bool(simple_captcha.verify(c_text, c_hash))
        simple_captcha.verified_captchas.clear()

        if (not verified) or (not claim_captcha_token(c_text, c_hash)):
            return {"error": "Error: Failed captcha"}, 403

    if not curls.check_curl(curl):
        return {"error": invalid_curl}, 400

    key = curls.make_key()

    if not curls.add_curl(curl, key):
        return {"error": "Error: Curl already exists"}, 409

    return {"curl": curl, "key": key}, 201


def change_proc(request: Any) -> tuple[str, int]:
    curl = curls.clean_curl(request.form.get("curl", ""))
    key = curls.clean_key(request.form.get("key", ""))
    status = curls.clean_status(request.form.get("status", ""))

    if (not curl) or (not key) or (not status):
        return "Error: Empty fields", 400

    if not curls.check_curl(curl):
        return invalid_curl, 400

    if not curls.check_status(status):
        return invalid_status, 400

    if not curls.check_key(curl, key):
        return invalid_key, 401

    curls.change_status(curl, status)
    return "ok", 200


def curl_proc(curl: str) -> tuple[str, int]:
    cleaned = curls.clean_curl(curl)

    if not curls.check_curl(cleaned):
        return invalid_curl, 400

    result = curls.get_value(cleaned, "status")

    if not result:
        return curls.fill_status(result), 404

    return curls.fill_status(result), 200


def curls_proc(request: Any) -> Any:
    raw_items = request.form.getlist("curl")

    if len(raw_items) > config.max_curls:
        ans = curls.too_many_curls()
        return Response(ans, status=400, mimetype=config.text_mtype)

    cleaned_items: list[str] = []

    for raw_curl in raw_items:
        curl = curls.clean_curl(raw_curl)

        if not curls.check_curl(curl):
            ans = invalid_curl
            return Response(ans, status=400, mimetype=config.text_mtype)

        cleaned_items.append(curl)

    unique_items = list(dict.fromkeys(cleaned_items))
    results = curls.get_curl_list(unique_items)
    return jsonify(results)
