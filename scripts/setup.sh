# scripts/setup.sh

#!/bin/bash
echo "🛠️ Setting up FX Converter API project..."

# Check Node.js version

node_version=$(node -v)
echo "📋 Node.js version: $node_version"

if [["$node_version" < "v16.0.0"]]; then
echo "⚠️ Warning: Node.js version 16+ is recommended"
fi

# Install dependencies

echo "📦 Installing dependencies..."
npm install

# Copy environment file

if [ ! -f .env ]; then
echo "📝 Creating .env file from template..."
cp .env.example .env
echo "✏️ Please update .env file with your configuration:"
echo " - MongoDB connection string"
echo " - JWT secret key"
echo " - Other environment variables"
fi

# Create logs directory

mkdir -p logs

# Make scripts executable

chmod +x scripts/\*.sh

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start MongoDB (if running locally)"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "Available scripts:"
echo " npm run dev - Start development server"
echo " npm run build - Build for production"
echo " npm run start - Start production server"
echo " npm run lint - Check TypeScript types"