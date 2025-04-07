#!/usr/bin/env bash

# Get the number of commits
commit_count=$(git rev-list --count HEAD)

# Create a tag with the commit count
git tag "$commit_count"

# Push the tag to the remote repository
git push origin "$commit_count"