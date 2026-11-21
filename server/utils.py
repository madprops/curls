from __future__ import annotations

# Standard
import logging


logger = logging.getLogger("curls")


def error(e: Exception) -> None:
    logger.exception("Unhandled error: %s", e)


def log(s: str) -> None:
    logger.info("%s", s)
