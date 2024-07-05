#!/usr/bin/env bash
# Count the total number of lines

cd server/
echo "Python:"
wc -l app.py procs.py db.py bundle.py | awk 'END {print $1}'

cd static/dashboard/js/main/
echo "Javascript:"
find . -type f -name "*.js" -exec wc -l {} \; | awk '{t+=$1} END {print t}'