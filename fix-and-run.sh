#!/bin/bash

# Enhanced fix-and-run script for AI Fight Club frontend
# Optimized for Next.js 15 and Node.js 20 LTS

echo "🚀 AI Fight Club Frontend - Development Server"
echo "=============================================="

# Step 1: Check Node.js version
NODE_VERSION=$(node -v)
echo "📊 Node.js version: $NODE_VERSION"

if [[ ! $NODE_VERSION =~ ^v20 ]]; then
  echo "⚠️  Warning: This application is optimized for Node.js 20 LTS."
  echo "   Current version: $NODE_VERSION"
  echo "   Some features may not work correctly."
  echo ""
fi

# Step 2: Clean up existing processes and cache
echo "🧹 Cleaning environment..."
pkill -f node || true
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Environment cleaned"

# Step 3: Verify dependencies
echo "🔍 Verifying dependencies..."
if [ ! -d "node_modules/next" ]; then
  echo "⚠️  Dependencies not installed. Running npm install..."
  npm install
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies verified"
fi

# Step 4: Set environment variables
echo "⚙️  Configuring environment..."
export NEXT_TELEMETRY_DISABLED=1
export NEXT_HMR_ALLOW_ORIGIN='*'
echo "✅ Environment configured"

# Step 5: Start development server with Turbopack
echo "🚀 Starting Next.js development server with Turbopack..."
echo "📝 Access the application at: http://localhost:3333"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================================="

# Use Turbopack for faster development
npx next dev --turbo -p 3333
