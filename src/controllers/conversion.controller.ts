// ================================
// src/controllers/conversion.controller.ts - FIXED ObjectId conversions
import { Response } from 'express';
import { ConversionService, ExchangeRateService, EventLogger } from '../services';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export class ConversionController {
 static createConversion = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { fromCurrency, toCurrency, amount } = req.body;
  const userId = req.user!._id.toString();

  const conversion = await ConversionService.create(userId, {
   fromCurrency,
   toCurrency,
   amount
  });

  res.status(201).json({
   success: true,
   message: 'Conversion created successfully',
   data: { conversion }
  });
 });

 static getConversions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  const { fromCurrency, toCurrency, startDate, endDate } = req.query;

  const filters = {
   fromCurrency: fromCurrency as string,
   toCurrency: toCurrency as string,
   startDate: startDate as string,
   endDate: endDate as string
  };

  const result = await ConversionService.getUserConversions(
   userId,
   filters,
   req.pagination
  );

  res.json({
   success: true,
   message: 'Conversions retrieved successfully',
   ...result
  });
 });

 static getConversionById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id.toString();

  const conversion = await ConversionService.getConversionById(id, userId);

  if (!conversion) {
   throw new AppError('Conversion not found', 404);
  }

  res.json({
   success: true,
   data: { conversion }
  });
 });

 static deleteConversion = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id.toString();

  const deleted = await ConversionService.deleteConversion(id, userId);

  if (!deleted) {
   throw new AppError('Conversion not found', 404);
  }

  res.json({
   success: true,
   message: 'Conversion deleted successfully'
  });
 });

 static getSummary = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();

  const [summary, stats, recentConversions] = await Promise.all([
   ConversionService.getUserSummary(userId),
   ConversionService.getConversionStats(userId),
   ConversionService.getRecentConversions(userId, 5)
  ]);

  // Log dashboard view
  await EventLogger.log('DASHBOARD_VIEWED', userId, {
   viewTime: new Date()
  });

  res.json({
   success: true,
   data: {
    summary,
    stats,
    recentConversions
   }
  });
 });

 static getExchangeRate = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { from, to } = req.params;
  const userId = req.user!._id.toString();

  const rate = await ExchangeRateService.getRate(from, to);

  // Log rate fetch
  await EventLogger.log('RATE_FETCHED', userId, {
   fromCurrency: from.toUpperCase(),
   toCurrency: to.toUpperCase(),
   rate
  });

  res.json({
   success: true,
   data: {
    fromCurrency: from.toUpperCase(),
    toCurrency: to.toUpperCase(),
    rate,
    timestamp: new Date()
   }
  });
 });

 static getSupportedCurrencies = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const currencies = await ExchangeRateService.getSupportedCurrencies();

  res.json({
   success: true,
   data: { currencies }
  });
 });
}
