#!/bin/bash

set -euo pipefail

# Usage:
#   ./auto-deploy.sh "commit message"
# Optional overrides:
#   SOURCE_BRANCH=main-sync TARGET_BRANCH=main ./auto-deploy.sh "commit message"

MSG="${1:-}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main-sync}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"

if [ -z "$MSG" ]; then
  echo "Usage: ./auto-deploy.sh \"commit message\""
  echo "Optional: SOURCE_BRANCH=main-sync TARGET_BRANCH=main ./auto-deploy.sh \"commit message\""
  exit 1
fi

echo "🚀 Deploy: commit on '$SOURCE_BRANCH' → merge into '$TARGET_BRANCH' → push '$TARGET_BRANCH' (Netlify Production)"

echo "🔄 Fetching latest..."
git fetch origin --prune

echo "🌿 Switching to source branch: $SOURCE_BRANCH"
git checkout "$SOURCE_BRANCH"

echo "📂 Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "ℹ️  Nothing to commit on '$SOURCE_BRANCH' (no staged changes)."
else
  echo "💾 Creating commit on '$SOURCE_BRANCH'..."
  git commit -m "$MSG"
fi

echo "🌐 Pushing source branch..."
git push origin "$SOURCE_BRANCH"

echo "🌿 Switching to target branch: $TARGET_BRANCH"
git checkout "$TARGET_BRANCH"

echo "⬇️  Updating target branch (fast-forward only)..."
git pull --ff-only origin "$TARGET_BRANCH"

if [ "$SOURCE_BRANCH" != "$TARGET_BRANCH" ]; then
  echo "🔀 Merging '$SOURCE_BRANCH' into '$TARGET_BRANCH'..."
  git merge --no-ff "$SOURCE_BRANCH" -m "$MSG"
fi

echo "🌐 Pushing target branch (triggers Netlify Production deploy)..."
git push origin "$TARGET_BRANCH"

echo "↩️  Returning to source branch: $SOURCE_BRANCH"
git checkout "$SOURCE_BRANCH"

echo "✅ Done. Netlify should deploy from '$TARGET_BRANCH'."