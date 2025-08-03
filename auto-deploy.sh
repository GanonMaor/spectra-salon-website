#!/bin/bash

echo "🚀 Starting automatic deployment..."

# Install new packages first
echo "📦 Installing chart.js packages..."
npm install

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
git commit -m "Add Chart.js dependencies and restore clean Overview design"

# Push to remote
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete! Netlify will now rebuild automatically."
echo "🔄 Check https://app.netlify.com/ for deployment status"
echo ""
echo "📄 Changes made:"
echo "  ✅ Installed chart.js and react-chartjs-2"
echo "  ✅ Added recharts as backup"
echo "  ✅ Restored clean Overview design with dynamic charts"
echo "  ✅ Fixed TypeScript dependencies"