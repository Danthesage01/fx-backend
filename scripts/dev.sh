# scripts/dev.sh

#!/bin/bash
echo "🚀 Starting FX Converter API in development mode..."

# Check if .env file exists

if [ ! -f .env ]; then
echo "📝 .env file not found, copying from .env.example..."
cp .env.example .env
echo "⚠️ Please update .env file with your configuration"
fi

# Check if node_modules exists

if [ ! -d "node_modules" ]; then
echo "📦 Installing dependencies..."
npm install
fi

# Start development server

echo "🔧 Starting development server with TypeScript compilation..."
npm run dev