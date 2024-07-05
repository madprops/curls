# Count the total number of lines
cd server/static/dashboard/js/main/
find . -type f -name "*.js" -exec wc -l {} \; | awk '{t+=$1} END {print t}'