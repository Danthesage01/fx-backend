// src/routes/index.ts - CREATE THIS FILE
import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { conversionRoutes } from './conversion.routes';
import { rateRoutes } from './rate.routes';
import { eventRoutes } from './event.routes';
import { healthRoutes } from './health.routes';

const router = Router();

// api/v1 routes
router.use('/auth', authRoutes);
router.use('/conversions', conversionRoutes);
router.use('/rates', rateRoutes);
router.use('/events', eventRoutes);
router.use('/health', healthRoutes);

// api/v1 info route
router.get('/', (req, res) => {
 res.json({
  success: true,
  message: 'FX Converter api/v1',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  documentation: {
   endpoints: {
    auth: '/api/v1/auth',
    conversions: '/api/v1/conversions',
    rates: '/api/v1/rates',
    events: '/api/v1/events',
    health: '/api/v1/health'
   }
  }
 });
});

// 404 handler for api/v1 routes
router.use('*', (req, res) => {
 res.status(404).json({
  success: false,
  error: `Route ${req.originalUrl} not found`,
  availableRoutes: [
   'GET /api/v1',
   'POST /api/v1/auth/register',
   'POST /api/v1/auth/login',
   'GET /api/v1/auth/profile',
   'PUT /api/v1/auth/profile',
   'POST /api/v1/auth/change-password',
   'POST /api/v1/auth/logout',
   'GET /api/v1/conversions',
   'POST /api/v1/conversions',
   'GET /api/v1/conversions/summary',
   'GET /api/v1/conversions/currencies',
   'GET /api/v1/conversions/:id',
   'DELETE /api/v1/conversions/:id',
   'GET /api/v1/rates/:from/:to',
   'GET /api/v1/events',
   'GET /api/v1/events/stats',
   'GET /api/v1/health',
   'GET /api/v1/health/ready',
   'GET /api/v1/health/live'
  ]
 });
});

export { router as apiRoutes };