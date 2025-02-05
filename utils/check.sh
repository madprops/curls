#!/usr/bin/env bash
cd server
clear &&
ruff format && ruff check &&
mypy --strict --strict --strict app.py &&
pyright