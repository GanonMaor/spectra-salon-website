#!/bin/bash

echo "🚀 Setting up Spectra Salon Development Environment"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with your Neon database credentials"
    echo "   Copy from .env.example and fill in your values"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 18+"
    exit 1
fi

# Check if Docker is running (optional)
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo "✅ Docker is running"
        echo "🐳 Starting pgAdmin for database management..."
        docker-compose up -d pgadmin
        echo "🔗 pgAdmin available at: http://localhost:8080"
        echo "   Email: admin@admin.com"
        echo "   Password: admin"
    else
        echo "⚠️  Docker is installed but not running"
        echo "   You can start it manually to use pgAdmin"
    fi
else
    echo "⚠️  Docker not found - pgAdmin won't be available"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "🔧 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🌟 To start development:"
echo "   netlify dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   http://localhost:8899"
echo ""
echo "🔧 Available services:"
echo "   - React App: http://localhost:8899"
echo "   - Netlify Functions: http://localhost:8899/.netlify/functions/"
echo "   - pgAdmin (if Docker running): http://localhost:8080"
echo ""
echo "📊 Database:"
echo "   - Primary: Neon PostgreSQL (configured in .env)"
echo "   - Local testing: Available via Docker if needed"
echo "" 