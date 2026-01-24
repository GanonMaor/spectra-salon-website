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
git checkout "$TARGET_BRANCH" 2>/dev/null || true

echo "🧭 Aligning local '$TARGET_BRANCH' to 'origin/$TARGET_BRANCH'..."
# If local target branch diverged, keep a local backup ref before realigning.
REMOTE_TARGET="$(git rev-parse "origin/$TARGET_BRANCH")"
LOCAL_TARGET=""
if git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
  LOCAL_TARGET="$(git rev-parse "$TARGET_BRANCH")"
fi

if [ -n "$LOCAL_TARGET" ] && [ "$LOCAL_TARGET" != "$REMOTE_TARGET" ]; then
  BACKUP_BRANCH="backup/${TARGET_BRANCH}-$(date +%Y%m%d-%H%M%S)"
  echo "🛟 Local '$TARGET_BRANCH' differs from remote; creating backup branch: $BACKUP_BRANCH"
  git branch "$BACKUP_BRANCH" "$LOCAL_TARGET" >/dev/null 2>&1 || true
fi

git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH"

if [ "$SOURCE_BRANCH" != "$TARGET_BRANCH" ]; then
  echo "🔀 Merging '$SOURCE_BRANCH' into '$TARGET_BRANCH'..."
  git merge --no-ff "$SOURCE_BRANCH" -m "$MSG"
fi

echo "🌐 Pushing target branch (triggers Netlify Production deploy)..."
git push origin "$TARGET_BRANCH"

echo "↩️  Returning to source branch: $SOURCE_BRANCH"
git checkout "$SOURCE_BRANCH"

echo "✅ Done. Netlify should deploy from '$TARGET_BRANCH'."