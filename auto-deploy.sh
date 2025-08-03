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
git commit -m "Add comprehensive design system and security guidelines"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Added design system guidelines to README.md"
echo "  ✅ Created comprehensive DESIGN.md file"
echo "  ✅ Security best practices documented"
echo "  ✅ Component library and CSS examples included"