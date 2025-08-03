#!/bin/bash

echo "🚀 Starting deployment with Marketing sidebar..."

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
git commit -m "Add Marketing section to AdminSidebar navigation"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🔄 Marketing tab will appear in sidebar after rebuild"
echo ""
echo "📄 Changes:"
echo "  ✅ Added Marketing group to AdminSidebar"
echo "  ✅ Added MegaphoneIcon import"
echo "  ✅ Marketing Dashboard path: /admin/marketing"
echo "  🎯 Marketing tab will be visible between Dashboard and Clients"