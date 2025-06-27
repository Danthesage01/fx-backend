# scripts/build.sh

#!/bin/bash
echo "🏗️ Building FX Converter API for production..."

# Clean previous build

echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies

echo "📦 Installing production dependencies..."
npm ci --only=production

# Build TypeScript

echo "🔨 Compiling TypeScript..."
npm run build

# Check if build was successful

if [ -d "dist" ]; then
echo "✅ Build completed successfully!"
echo "📁 Build output available in: ./dist/"
else
echo "❌ Build failed!"
exit 1
fi
