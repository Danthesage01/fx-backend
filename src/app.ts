// src/app.ts
import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { apiRoutes } from './routes/index';
import {
 globalErrorHandler,
 createRateLimiter,
 helmetConfig
} from './middleware';
import passport from './config/passport';

// Add after your existing middleware, before routes

export const createApp = (): Application => {
 const app = express();

 // Trust proxy for accurate IP addresses (important for rate limiting)
 app.set('trust proxy', 1);

 // Security middleware
 app.use(helmetConfig);

 app.use(passport.initialize());

 // Rate limiting
 const rateLimiter = createRateLimiter();
 app.use('/api/v1', rateLimiter);

 // CORS configuration
 const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
   // Allow requests with no origin (mobile apps, curl, etc.)
   if (!origin) return callback(null, true);

   const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001'
   ];

   // In development, allow any localhost origin
   if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return callback(null, true);
   }

   if (allowedOrigins.includes(origin)) {
    callback(null, true);
   } else {
    callback(new Error('Not allowed by CORS policy'));
   }
  },
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
 };

 app.use(cors(corsOptions));

 // Body parsing middleware
 app.use(express.json({ limit: '10mb' }));
 app.use(express.urlencoded({ extended: true, limit: '10mb' }));

 // Compression middleware
 app.use(compression());

 // Logging middleware
 if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
 } else {
  app.use(morgan('combined'));
 }

 // Custom request logging middleware
 app.use((req: Request, res: Response, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
   const duration = Date.now() - startTime;
   console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
 });

 // Health check route (before API routes for performance)
 app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
   status: 'OK',
   timestamp: new Date().toISOString(),
   uptime: process.uptime()
  });
 });

 // API routes
 app.use('/api/v1', apiRoutes);

 // Root route
 app.get('/', (req: Request, res: Response) => {
  res.json({
   success: true,
   message: 'FX Converter API Server',
   version: '1.0.0',
   timestamp: new Date().toISOString(),
   environment: process.env.NODE_ENV,
   documentation: '/api/v1/docs'
  });
 });

 // 404 handler for non-API routes
 app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
   success: false,
   error: 'Endpoint not found',
   message: `Cannot ${req.method} ${req.originalUrl}`,
   availableEndpoints: {
    api: '/api/v1',
    health: '/health',
    documentation: '/api/v1/docs'
   }
  });
 });

 // Global error handler (must be last)
 app.use(globalErrorHandler);

 return app;
};
