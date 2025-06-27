

// src/routes/health.routes.ts
import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();

// Health check routes (no auth required)
router.get('/', HealthController.checkHealth);
router.get('/ready', HealthController.checkReadiness);
router.get('/live', HealthController.checkLiveness);

export { router as healthRoutes };