#!/bin/bash

echo "🚀 Starting deployment with Overview design updates..."

# Force add all files including new ones
echo "📂 Adding all files to git..."
git add . --force

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "📄 Checking for untracked files..."
    git add -A
fi

# Commit with concise message
echo "💾 Creating commit..."
git commit -m "Apply marketing design to overview components"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🔄 Overview will have updated design after rebuild"
echo ""
echo "📄 Changes:"
echo "  ✅ Updated OverviewHeader with marketing-style layout"
echo "  ✅ Enhanced KPI cards with gradient backgrounds"
echo "  ✅ Added hover tooltips to overview cards"
echo "  🎯 Overview now matches marketing dashboard design"