# README.md template

A robust TypeScript/Express API for foreign exchange conversion with authentication and audit trail.

## Features

- 🔐 JWT Authentication with secure password hashing
- 💱 Real-time currency conversion using external APIs
- 📊 User dashboard with conversion history and statistics
- 🔍 Advanced filtering and pagination
- 📋 Comprehensive audit trail and event logging
- 🛡️ Security features (rate limiting, CORS, helmet)
- 📱 RESTful API design with comprehensive validation
- 🏥 Health checks and monitoring endpoints

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Rate limiting
- **External APIs**: Exchange rate providers
- **Development**: TypeScript, Nodemon, ts-node

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone and setup:
   \`\`\`bash
   git clone <repository-url>
   cd fx-converter-backend
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   \`\`\`

2. Configure environment:
   \`\`\`bash

# Copy environment template

cp .env.example .env

# Edit .env file with your configuration

nano .env
\`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

\`\`\`env
NODE_ENV=development
PORT=5000

# Database

MONGODB_URI=mongodb://localhost:27017/fx-converter

# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/fx-converter

# JWT

JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# External APIs

EXCHANGE_RATE_API_URL=https://api.exchangerate.host

# CORS

FRONTEND_URL=http://localhost:3000

# Rate Limiting

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

## API Endpoints

### Authentication

- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/profile\` - Get user profile
- \`PUT /api/auth/profile\` - Update user profile
- \`POST /api/auth/change-password\` - Change password
- \`POST /api/auth/logout\` - User logout

### Conversions

- \`GET /api/conversions\` - Get user conversions (with filtering & pagination)
- \`POST /api/conversions\` - Create new conversion
- \`GET /api/conversions/summary\` - Get conversion summary and stats
- \`GET /api/conversions/currencies\` - Get supported currencies
- \`GET /api/conversions/:id\` - Get specific conversion
- \`DELETE /api/conversions/:id\` - Delete conversion

### Exchange Rates

- \`GET /api/rates/:from/:to\` - Get live exchange rate

### Events (Audit Trail)

- \`GET /api/events\` - Get user events (with filtering & pagination)
- \`GET /api/events/stats\` - Get event statistics

### Health Checks

- \`GET /api/health\` - Application health status
- \`GET /api/health/ready\` - Readiness probe
- \`GET /api/health/live\` - Liveness probe

## Project Structure

\`\`\`
src/
├── controllers/ # Request handlers
├── middleware/ # Custom middleware (auth, validation, etc.)
├── models/ # Mongoose schemas
├── routes/ # Express routes
├── services/ # Business logic layer
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
├── validators/ # Zod validation schemas
├── config/ # Configuration files
├── app.ts # Express app setup
└── server.ts # Server entry point
\`\`\`

## Development

### Available Scripts

\`\`\`bash
npm run dev # Start development server with hot reload
npm run build # Build for production
npm run start # Start production server
npm run lint # TypeScript type checking
npm run dev:simple # Start with ts-node (simpler, slower)
\`\`\`

### Development Workflow

1. Make changes to TypeScript files in \`src/\`
2. Server automatically restarts on file changes
3. Check logs for any TypeScript errors
4. Use MongoDB Compass or similar to inspect database

### Adding New Features

1. **Add Types**: Define interfaces in \`src/types/\`
2. **Create Model**: Add Mongoose schema in \`src/models/\`
3. **Add Validation**: Create Zod schemas in \`src/validators/\`
4. **Business Logic**: Implement in \`src/services/\`
5. **Controllers**: Add request handlers in \`src/controllers/\`
6. **Routes**: Define endpoints in \`src/routes/\`

## Deployment

### Railway Deployment

1. Install Railway CLI:
   \`\`\`bash
   npm install -g @railway/cli
   \`\`\`

2. Login and deploy:
   \`\`\`bash
   railway login
   railway init
   railway up
   \`\`\`

3. Set environment variables in Railway dashboard

### Manual Deployment

1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Set production environment variables

3. Start the server:
   \`\`\`bash
   NODE_ENV=production node dist/server.js
   \`\`\`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages in production

## Monitoring

### Health Checks

The API provides multiple health check endpoints:

- \`/health\` - Basic health status
- \`/api/health/ready\` - Readiness probe (dependencies check)
- \`/api/health/live\` - Liveness probe (application status)

### Logging

- Development: Detailed console logs with Morgan
- Production: Structured logging for monitoring systems
- Request/Response timing
- Error tracking with stack traces

### Audit Trail

All user actions are logged in the events collection:

- User registrations and logins
- Conversion creations
- Rate fetches
- Failed authentication attempts

## Testing

### Manual Testing with curl

\`\`\`bash

# Register user

curl -X POST http://localhost:5000/api/auth/register \\
-H "Content-Type: application/json" \\
-d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login

curl -X POST http://localhost:5000/api/auth/login \\
-H "Content-Type: application/json" \\
-d '{"email":"test@example.com","password":"Test123!"}'

# Create conversion (replace TOKEN with actual JWT)

curl -X POST http://localhost:5000/api/conversions \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer TOKEN" \\
-d '{"fromCurrency":"USD","toCurrency":"NGN","amount":1000}'
\`\`\`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**

   - Check MongoDB is running
   - Verify connection string in .env
   - For Atlas: check IP whitelist and credentials

2. **TypeScript Compilation Errors**

   - Run \`npm run lint\` to check types
   - Ensure all dependencies are installed
   - Check for syntax errors in recent changes

3. **Authentication Issues**

   - Verify JWT_SECRET is set
   - Check token format in Authorization header
   - Ensure user exists in database

4. **Rate Limiting**
   - Wait for rate limit window to reset
   - Adjust limits in environment variables
   - Check IP address in logs

### Debug Mode

Set environment variables for detailed logging:
\`\`\`bash
DEBUG=\* npm run dev
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
" > README.md
