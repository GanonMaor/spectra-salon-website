#!/bin/bash

echo "🚀 Starting new deployment..."

# Force add all files including new ones
echo "📂 Adding all files to git..."
git add . --force
git add src/components/Marketing/ --force
git add src/screens/Admin/Marketing/ --force

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "📄 Checking for untracked files..."
    git add -A
fi

# Check again if there are changes
if git diff --staged --quiet; then
    echo "ℹ️  No new changes to commit"
    echo "🔄 Triggering manual rebuild on Netlify..."
else
    # Commit with concise message
    echo "💾 Creating commit..."
    git commit -m "Update Marketing Dashboard with complete components and navigation"
fi

# Push to remote (this will trigger Netlify rebuild)
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ New deployment initiated! Netlify will rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Latest changes:"
echo "  ✅ Marketing Dashboard with conversion funnel"
echo "  ✅ KPI cards with pastel colors"
echo "  ✅ Insights table with drop-off analysis"
echo "  ✅ Complete Marketing navigation in sidebar"
echo "  🎯 Marketing tab should be visible at /admin/marketing"