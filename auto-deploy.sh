#!/bin/bash

echo "🚀 Starting automatic deployment..."

# Force add all files including new ones
echo "📂 Adding all files to git..."
git add . --force
git add src/components/Overview/ --force

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "📄 Checking for untracked files..."
    git add -A
fi

# Commit with concise message
echo "💾 Creating commit..."
git commit -m "Implement startup-scale Overview dashboard with dynamic charts"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Added Overview components directory"
echo "  ✅ Implemented KPI cards with metrics"
echo "  ✅ Added dynamic growth and retention charts"
echo "  ✅ Fixed TypeScript exports"