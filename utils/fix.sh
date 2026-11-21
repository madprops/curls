#!/usr/bin/env bash
clear &&
cd server &&
ruff format && ruff check --fix &&
mypy --strict app.py
pyright