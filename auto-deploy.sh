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
git commit -m "Add complete Overview page CSS and React components with Figma-based design system"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Complete Overview page CSS implementation"
echo "  ✅ Production-ready React components"
echo "  ✅ Figma-based design system with exact specifications"
echo "  ✅ Responsive design for mobile and tablet"
echo "  ✅ Notification system and KPI cards"
echo "  ✅ Feature cards with gradients and animations"