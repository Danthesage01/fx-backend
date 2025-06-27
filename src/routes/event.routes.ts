// src/routes/event.routes.ts
import { Router } from 'express';
import { EventController } from '../controllers';
import { validate, authenticateToken, paginationMiddleware } from '../middleware';
import { getEventsSchema } from '../validators';

const router = Router();

// Apply auth middleware
router.use(authenticateToken);

// Event routes
router.get(
 '/',
 paginationMiddleware,
 validate(getEventsSchema),
 EventController.getEvents
);

router.get('/stats', EventController.getEventStats);

export { router as eventRoutes };