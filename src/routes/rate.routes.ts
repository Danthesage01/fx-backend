import { Router } from 'express';
import { ConversionController } from '../controllers';
import { validate, authenticateToken } from '../middleware';
import { getExchangeRateParamsSchema } from '../validators';
import { z } from 'zod';

const router = Router();

// Protect all routes under /rates
router.use(authenticateToken);

// GET /rates/:from/:to
router.get(
 '/:from/:to',
 validate(z.object({ params: getExchangeRateParamsSchema })),
 ConversionController.getExchangeRate
);

export { router as rateRoutes };
