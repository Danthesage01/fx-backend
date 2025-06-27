// src/config/index.ts - UPDATED FOR CURRENT API STATE
export const config = {
 app: {
  name: 'FX Converter API',
  version: '1.0.0',
  description: 'Foreign Exchange Conversion API with JWT authentication, OAuth integration, refresh tokens, and comprehensive audit trail',
  environment: process.env.NODE_ENV || 'development'
 },

 server: {
  port: parseInt(process.env.PORT || '5700'),
  host: process.env.HOST || 'localhost',
  trustProxy: true, // For accurate IP addresses in rate limiting
  cors: {
   origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001'
   ],
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
   allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
   ],
   exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
   maxAge: 86400 // 24 hours
  }
 },

 database: {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fx-converter',
  options: {
   retryWrites: true,
   w: 'majority'
  }
 },

 auth: {
  // JWT Configuration
  jwt: {
   secret: process.env.JWT_SECRET || 'your-secret-key',
   refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
   accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    expiresInMinutes: parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '15')
   },
   refreshToken: {
    expiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7')
   },
   issuer: 'fx-converter-api',
   audience: 'fx-converter-app'
  },

  // OAuth Configuration
  oauth: {
   google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5700/api/v1/auth/google/callback',
    scope: ['profile', 'email']
   }
  },

  // Password Configuration
  password: {
   bcryptRounds: 12,
   minLength: 6
  }
 },

 security: {
  rateLimit: {
   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
   message: 'Too many requests from this IP',
   standardHeaders: true,
   legacyHeaders: false
  },

  helmet: {
   contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  }
 },

 external: {
  exchangeRate: {
   apiUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate.host',
   apiKey: process.env.EXCHANGE_RATE_API_KEY || '',
   timeout: 10000,
   supportedCurrencies: [
    'USD', 'EUR', 'GBP', 'NGN', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
    'KRW', 'MXN', 'RUB', 'ZAR', 'BRL', 'SGD', 'HKD', 'NOK', 'SEK', 'PLN'
   ]
  }
 },

 frontend: {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  oauth: {
   successUrl: process.env.FRONTEND_SUCCESS_URL || 'http://localhost:3000/auth/success',
   errorUrl: process.env.FRONTEND_ERROR_URL || 'http://localhost:3000/auth/error'
  }
 },

 features: {
  // Feature flags for different parts of the API
  oauth: {
   enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
   providers: ['google']
  },

  refreshTokens: {
   enabled: true,
   rotateOnRefresh: true // Revoke old token when refreshing
  },

  eventLogging: {
   enabled: true,
   supportedEvents: [
    'USER_REGISTERED',
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_LOGOUT_ALL',
    'PROFILE_UPDATED',
    'PASSWORD_CHANGED',
    'TOKEN_REFRESHED',
    'FAILED_LOGIN',
    'CONVERSION_CREATED',
    'CONVERSION_DELETED',
    'RATE_FETCHED',
    'DASHBOARD_VIEWED'
   ]
  },

  pagination: {
   defaultLimit: 10,
   maxLimit: 100,
   defaultSortOrder: 'desc'
  },

  conversions: {
   maxAmount: 1000000, // Maximum conversion amount
   minAmount: 0.01,    // Minimum conversion amount
   decimalPlaces: 2    // Round results to 2 decimal places
  }
 },

 logging: {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'dev'),
  format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
 },

 api: {
  version: 'v1',
  prefix: '/api/v1',
  documentation: {
   enabled: process.env.NODE_ENV !== 'production',
   path: '/docs'
  },
  endpoints: {
   auth: '/api/v1/auth',
   conversions: '/api/v1/conversions',
   rates: '/api/v1/rates',
   events: '/api/v1/events',
   health: '/api/v1/health'
  }
 },

 health: {
  checks: {
   database: true,
   memory: true,
   exchangeRateApi: true
  }
 }
};

// Helper functions for configuration validation
export const validateConfig = () => {
 const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET'
 ];

 const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

 if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
 }

 // Validate OAuth configuration if enabled
 if (config.features.oauth.enabled) {
  const oauthVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
  const missingOAuthVars = oauthVars.filter(varName => !process.env[varName]);

  if (missingOAuthVars.length > 0) {
   console.warn(`OAuth enabled but missing variables: ${missingOAuthVars.join(', ')}`);
  }
 }

 return true;
};

// Configuration getters for different modules
export const getAuthConfig = () => config.auth;
export const getServerConfig = () => config.server;
export const getDatabaseConfig = () => config.database;
export const getExternalConfig = () => config.external;
export const getSecurityConfig = () => config.security;
export const getFeaturesConfig = () => config.features;

// Environment-specific configurations
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isTesting = () => config.app.environment === 'test';

export default config;