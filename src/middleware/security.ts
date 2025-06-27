

// src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Rate limiting configuration
export const createRateLimiter = () => {
 return rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
   success: false,
   error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
   // Skip rate limiting for health checks
   return req.path === '/health' || req.path === '/api/health';
  }
 });
};

// Helmet security configuration
export const helmetConfig = helmet({
 contentSecurityPolicy: {
  directives: {
   defaultSrc: ["'self'"],
   styleSrc: ["'self'", "'unsafe-inline'"],
   scriptSrc: ["'self'"],
   imgSrc: ["'self'", "data:", "https:"],
  },
 },
 crossOriginEmbedderPolicy: false // Allow embedding for development
});
