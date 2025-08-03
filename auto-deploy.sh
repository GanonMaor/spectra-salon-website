#!/bin/bash

echo "🚀 Starting automatic deployment..."

# Add all changes
echo "📂 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "❌ No changes to commit"
    exit 0
fi

# Commit with concise message
echo "💾 Creating commit..."
git commit -m "Implement new Overview dashboard design with Figma-based styling"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Updated Dashboard Overview with new luxury design"
echo "  ✅ Added KPI cards with custom styling"
echo "  ✅ Added feature cards with gradients"
echo "  ✅ Added notification system"
echo "  ✅ Added month navigation"