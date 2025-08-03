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

# Commit with concise message (following user memory preference)
echo "💾 Creating commit..."
git commit -m "Fix environment variables for Netlify production auth"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"