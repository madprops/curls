#!/usr/bin/env bash
clear &&
cd server &&
ruff format && ruff check &&
mypy --strict --strict --strict app.py &&
pyright