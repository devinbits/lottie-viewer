#!/bin/bash

# Push Release Script
# Pushes the current branch and all tags to the remote repository

set -e

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "Warning: You have uncommitted changes"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    exit 1
  fi
fi

# Get remote name (default to origin)
REMOTE="${1:-origin}"

# Check if remote exists
if ! git remote get-url "$REMOTE" > /dev/null 2>&1; then
  echo "Error: Remote '$REMOTE' does not exist"
  echo "Available remotes:"
  git remote
  exit 1
fi

echo "Pushing release to remote: $REMOTE"
echo "Branch: $CURRENT_BRANCH"
echo ""

# Show tags that will be pushed
TAGS_TO_PUSH=$(git tag --list 'rc*' --sort=-version:refname | head -5)
if [ -n "$TAGS_TO_PUSH" ]; then
  echo "Recent release candidate tags:"
  echo "$TAGS_TO_PUSH" | sed 's/^/  - /'
  echo ""
fi

# Confirm before pushing
read -p "Push branch '$CURRENT_BRANCH' and all tags to '$REMOTE'? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Cancelled"
  exit 0
fi

# Push branch
echo "Pushing branch..."
if ! git push "$REMOTE" "$CURRENT_BRANCH"; then
  echo "Error: Failed to push branch"
  exit 1
fi

# Push all tags
echo "Pushing tags..."
if ! git push "$REMOTE" --tags; then
  echo "Error: Failed to push tags"
  exit 1
fi

echo ""
echo "Successfully pushed release to $REMOTE!"
echo "Branch: $CURRENT_BRANCH"
echo "Tags: All tags have been pushed"
