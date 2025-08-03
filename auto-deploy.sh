#!/bin/bash

echo "🚀 Starting automatic deployment..."

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

# Commit with concise message
echo "💾 Creating commit..."
git commit -m "Add Marketing Dashboard with conversion funnel and insights"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Added Marketing Dashboard with startup-scale design"
echo "  ✅ Created conversion funnel visualization"
echo "  ✅ Added pastel KPI cards (Leads/Q1/Paying)"
echo "  ✅ Added insights table with drop-off analysis"
echo "  ✅ Added action suggestions and focus areas"
echo "  ✅ Updated navigation to include Marketing tab"
echo "  ✅ Consistent with Overview dashboard styling"