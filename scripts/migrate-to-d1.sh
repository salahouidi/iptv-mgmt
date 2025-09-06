#!/bin/bash

# IPTV Management Platform - Migration to Cloudflare D1
# This script helps migrate from mock data to real D1 database

echo "🚀 IPTV Management Platform - Migration to Cloudflare D1"
echo "========================================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ You are not logged in to Cloudflare. Please login first:"
    echo "   wrangler login"
    exit 1
fi

echo "✅ Wrangler CLI is ready"

# Step 1: Create D1 Database
echo ""
echo "📊 Step 1: Creating D1 Database..."
echo "=================================="

read -p "Enter a name for your D1 database (default: iptv-management-db): " db_name
db_name=${db_name:-iptv-management-db}

echo "Creating database: $db_name"
db_output=$(wrangler d1 create $db_name 2>&1)

if [[ $? -eq 0 ]]; then
    echo "✅ Database created successfully"
    
    # Extract database ID from output
    db_id=$(echo "$db_output" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    echo "📝 Database ID: $db_id"
    
    # Update wrangler.toml
    if [ -f "wrangler.toml" ]; then
        sed -i.bak "s/YOUR_DATABASE_ID_HERE/$db_id/g" wrangler.toml
        echo "✅ Updated wrangler.toml with database ID"
    else
        echo "⚠️  wrangler.toml not found. Please update it manually with database ID: $db_id"
    fi
else
    echo "❌ Failed to create database"
    echo "$db_output"
    exit 1
fi

# Step 2: Create Database Schema
echo ""
echo "🏗️  Step 2: Creating Database Schema..."
echo "======================================"

if [ -f "database/schema.sql" ]; then
    echo "Executing schema.sql..."
    wrangler d1 execute $db_name --file=database/schema.sql
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Database schema created successfully"
    else
        echo "❌ Failed to create database schema"
        exit 1
    fi
else
    echo "❌ database/schema.sql not found"
    exit 1
fi

# Step 3: Seed Initial Data
echo ""
echo "🌱 Step 3: Seeding Initial Data..."
echo "================================="

read -p "Do you want to seed the database with initial data? (y/N): " seed_data
if [[ $seed_data =~ ^[Yy]$ ]]; then
    if [ -f "database/seed.sql" ]; then
        echo "Executing seed.sql..."
        wrangler d1 execute $db_name --file=database/seed.sql
        
        if [[ $? -eq 0 ]]; then
            echo "✅ Database seeded successfully"
        else
            echo "❌ Failed to seed database"
            exit 1
        fi
    else
        echo "❌ database/seed.sql not found"
    fi
else
    echo "⏭️  Skipping database seeding"
fi

# Step 4: Deploy Workers
echo ""
echo "⚡ Step 4: Deploying Cloudflare Workers..."
echo "========================================="

cd workers

# Install dependencies
if [ -f "package.json" ]; then
    echo "Installing Worker dependencies..."
    npm install
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "❌ workers/package.json not found"
    exit 1
fi

# Deploy to development
echo "Deploying to development environment..."
npm run deploy:staging

if [[ $? -eq 0 ]]; then
    echo "✅ Development deployment successful"
    
    # Get the worker URL
    worker_url=$(wrangler whoami 2>/dev/null | grep -o 'https://[^/]*\.workers\.dev' | head -1)
    if [ -n "$worker_url" ]; then
        echo "🌐 Development API URL: $worker_url/api"
        
        # Update frontend environment
        cd ..
        if [ -f ".env.development" ]; then
            sed -i.bak "s|https://your-dev-worker.your-subdomain.workers.dev|$worker_url|g" .env.development
            echo "✅ Updated .env.development with API URL"
        fi
    fi
else
    echo "❌ Failed to deploy to development"
    exit 1
fi

cd ..

# Step 5: Test API Connection
echo ""
echo "🧪 Step 5: Testing API Connection..."
echo "==================================="

if [ -n "$worker_url" ]; then
    echo "Testing health endpoint..."
    health_response=$(curl -s "$worker_url/api/health" 2>/dev/null)
    
    if [[ $? -eq 0 ]] && [[ $health_response == *"healthy"* ]]; then
        echo "✅ API is responding correctly"
        echo "Response: $health_response"
    else
        echo "⚠️  API test failed or returned unexpected response"
        echo "Response: $health_response"
    fi
else
    echo "⚠️  Could not determine worker URL for testing"
fi

# Step 6: Frontend Configuration
echo ""
echo "🎨 Step 6: Frontend Configuration..."
echo "==================================="

echo "To complete the migration, follow these steps:"
echo ""
echo "1. Copy environment file:"
echo "   cp .env.development .env.local"
echo ""
echo "2. Update .env.local with your actual worker URL:"
echo "   VITE_API_BASE_URL=$worker_url/api"
echo "   VITE_USE_MOCK_DATA=false"
echo ""
echo "3. Restart your development server:"
echo "   npm run dev"
echo ""
echo "4. Test the application to ensure everything works"

# Summary
echo ""
echo "🎉 Migration Summary"
echo "==================="
echo "✅ D1 Database created: $db_name"
echo "✅ Database ID: $db_id"
echo "✅ Schema and data deployed"
echo "✅ Workers deployed to development"
echo "🌐 API URL: $worker_url/api"
echo ""
echo "Next steps:"
echo "- Update .env.local with the API URL above"
echo "- Set VITE_USE_MOCK_DATA=false"
echo "- Restart your frontend development server"
echo "- Test all functionality"
echo ""
echo "For production deployment:"
echo "- Run: cd workers && npm run deploy:production"
echo "- Update .env.production with production API URL"
echo ""
echo "🚀 Migration completed successfully!"
