
// src/routes/conversion.routes.ts
import { Router } from 'express';
import { ConversionController } from '../controllers';
import { validate, authenticateToken, paginationMiddleware } from '../middleware';
import {
 createConversionSchema,
 getConversionsSchema,
 getConversionByIdSchema,
 deleteConversionSchema,
 getExchangeRateParamsSchema
} from '../validators';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Conversion routes
router
 .route('/')
 .get(
  paginationMiddleware,
  validate(getConversionsSchema),
  ConversionController.getConversions
 )
 .post(
  validate(createConversionSchema),
  ConversionController.createConversion
 );

router.get('/summary', ConversionController.getSummary);
router.get('/currencies', ConversionController.getSupportedCurrencies);

router
 .route('/:id')
 .get(
  validate(getConversionByIdSchema),
  ConversionController.getConversionById
 )
 .delete(
  validate(deleteConversionSchema),
  ConversionController.deleteConversion
 );





export { router as conversionRoutes };
