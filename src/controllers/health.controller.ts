// ===================================
// src/controllers/health.controller.ts - FIXED
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';

export class HealthController {
 static checkHealth = asyncHandler(async (req: Request, res: Response) => {
  const health = {
   status: 'OK',
   timestamp: new Date().toISOString(),
   uptime: process.uptime(),
   environment: process.env.NODE_ENV,
   version: process.env.npm_package_version || '1.0.0',
   services: {
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    memory: {
     used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
     total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
   }
  };

  // Test database connection
  try {
   if (mongoose.connection.db) {
    await mongoose.connection.db.admin().ping();
    health.services.database = 'Connected';
   } else {
    health.services.database = 'Not Connected';
    health.status = 'Degraded';
   }
  } catch (error) {
   health.services.database = 'Error';
   health.status = 'Degraded';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
 });

 static checkReadiness = asyncHandler(async (req: Request, res: Response) => {
  // Check if all required services are ready
  const checks = {
   database: false,
   environment: false
  };

  // Check database
  try {
   if (mongoose.connection.db) {
    await mongoose.connection.db.admin().ping();
    checks.database = true;
   }
  } catch (error) {
   checks.database = false;
  }

  // Check environment variables
  checks.environment = !!(
   process.env.MONGODB_URI &&
   process.env.JWT_SECRET &&
   process.env.EXCHANGE_RATE_API_URL
  );

  const ready = Object.values(checks).every(check => check === true);

  res.status(ready ? 200 : 503).json({
   ready,
   checks,
   timestamp: new Date().toISOString()
  });
 });

 static checkLiveness = asyncHandler(async (req: Request, res: Response) => {
  // Simple liveness check - if we can respond, we're alive
  res.json({
   alive: true,
   timestamp: new Date().toISOString(),
   pid: process.pid,
   uptime: process.uptime()
  });
 });
}