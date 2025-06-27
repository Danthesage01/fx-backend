# scripts/check-env.sh
#!/bin/bash
echo "🔍 Checking environment configuration..."

# Required environment variables
required_vars=(
    "NODE_ENV"
    "PORT"
    "MONGODB_URI"
    "JWT_SECRET"
    "EXCHANGE_RATE_API_URL"
)

missing_vars=()
weak_vars=()

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Source .env file
set -a
source .env
set +a

echo "📋 Environment: $NODE_ENV"
echo "🚪 Port: $PORT"

# Check required variables
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

# Check for weak configurations
if [ ${#JWT_SECRET} -lt 32 ]; then
    weak_vars+=("JWT_SECRET (should be at least 32 characters)")
fi

if [[ "$MONGODB_URI" == *"localhost"* ]] && [[ "$NODE_ENV" == "production" ]]; then
    weak_vars+=("MONGODB_URI (using localhost in production)")
fi

# Report results
if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set"
else
    echo "❌ Missing required environment variables:"
    printf '   %s\n' "${missing_vars[@]}"
    exit 1
fi

if [ ${#weak_vars[@]} -eq 0 ]; then
    echo "✅ Environment configuration looks secure"
else
    echo "⚠️  Security warnings:"
    printf '   %s\n' "${weak_vars[@]}"
fi

# Test database connection
echo ""
echo "🔗 Testing database connection..."
if command -v mongosh &> /dev/null; then
    if mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "Please check your MongoDB URI and ensure MongoDB is running"
    fi
else
    echo "⚠️  mongosh not found - skipping database connection test"
fi

# Test external API
echo ""
echo "🌐 Testing external API..."
if curl -s "$EXCHANGE_RATE_API_URL/latest" > /dev/null; then
    echo "✅ External API accessible"
else
    echo "❌ External API not accessible"
    echo "Please check your internet connection and API URL"
fi

echo ""
echo "✅ Environment check completed!"