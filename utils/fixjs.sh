#!/usr/bin/env bash
files=$(git ls-files -- "*.js")
files=$(echo $files | tr " " "\n" | grep -vE '(^|/)dist/' | grep -vE '(^|/)vite.config.js$' | grep -vE '(^|/)libs/*' | tr "\n" " ")

if [ -n "$files" ]; then
  npm run --silent fix $files
fi