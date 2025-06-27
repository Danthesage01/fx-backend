# scripts/start-prod.sh

#!/bin/bash
echo "🚀 Starting FX Converter API in production mode..."

# Check if build exists

if [ ! -d "dist" ]; then
echo "❌ Build not found. Running build first..."
./scripts/build.sh
fi

# Check if .env file exists

if [ ! -f .env ]; then
echo "❌ .env file not found. Please create it with production values."
exit 1
fi

# Start production server

echo "🌟 Starting production server..."
NODE_ENV=production node dist/server.js