// src/services/conversion.service.ts
import { Types } from 'mongoose';
import { Conversion } from '../models';
import {
  IConversion,
  CreateConversionRequest,
  ConversionFilters,
  ConversionSummary,
  PaginationOptions,
  PaginatedResult
} from '../types';
import { PaginationService, AppError } from '../utils/';
import { ExchangeRateService } from './exchangeRate.service';
import { EventLogger } from './event.service';

export class ConversionService {
  static async create(
    userId: string,
    conversionData: CreateConversionRequest
  ): Promise<IConversion> {
    const { fromCurrency, toCurrency, amount } = conversionData;

    // Validate currencies are different
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      throw new AppError('Source and target currencies cannot be the same', 400);
    }

    // Get current exchange rate
    const rate = await ExchangeRateService.getRate(fromCurrency, toCurrency);

    // Log rate fetch event
    await EventLogger.log('RATE_FETCHED', userId, {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate
    });

    // Calculate converted amount
    const convertedAmount = amount * rate;

    // Create conversion record
    const conversion = await Conversion.create({
      userId: new Types.ObjectId(userId),
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      amount,
      rate,
      convertedAmount
    });

    // Log conversion creation
    await EventLogger.log('CONVERSION_CREATED', userId, {
      conversionId: conversion._id,
      fromCurrency: conversion.fromCurrency,
      toCurrency: conversion.toCurrency,
      amount: conversion.amount,
      convertedAmount: conversion.convertedAmount
    });

    return conversion;
  }

  static async getUserConversions(
    userId: string,
    filters: ConversionFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<IConversion>> {
    // Build query
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters.fromCurrency) {
      query.fromCurrency = filters.fromCurrency.toUpperCase();
    }

    if (filters.toCurrency) {
      query.toCurrency = filters.toCurrency.toUpperCase();
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return await PaginationService.paginate<IConversion>(
      Conversion,
      query,
      pagination
    );
  }

  static async getUserSummary(userId: string): Promise<ConversionSummary[]> {
    const summary = await Conversion.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$toCurrency',
          totalAmount: { $sum: '$convertedAmount' },
          count: { $sum: 1 },
          avgRate: { $avg: '$rate' },
          lastConversion: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          currency: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
          avgRate: { $round: ['$avgRate', 4] },
          lastConversion: 1,
          _id: 0
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return summary;
  }

  static async getConversionById(
    conversionId: string,
    userId: string
  ): Promise<IConversion | null> {
    const conversion = await Conversion.findOne({
      _id: conversionId,
      userId: new Types.ObjectId(userId)
    });

    return conversion;
  }

  static async deleteConversion(
    conversionId: string,
    userId: string
  ): Promise<boolean> {
    const result = await Conversion.deleteOne({
      _id: conversionId,
      userId: new Types.ObjectId(userId)
    });

    if (result.deletedCount > 0) {
      await EventLogger.log('CONVERSION_DELETED', userId, {
        conversionId
      });
      return true;
    }

    return false;
  }

  static async getRecentConversions(
    userId: string,
    limit: number = 5
  ): Promise<IConversion[]> {
    return await Conversion.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  static async getConversionStats(userId: string) {
    const stats = await Conversion.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: 1 },
          totalAmountConverted: { $sum: '$amount' },
          uniqueCurrencyPairs: {
            $addToSet: {
              $concat: ['$fromCurrency', '→', '$toCurrency']
            }
          },
          avgConversionAmount: { $avg: '$amount' },
          lastConversion: { $max: '$createdAt' },
          firstConversion: { $min: '$createdAt' }
        }
      },
      {
        $project: {
          totalConversions: 1,
          totalAmountConverted: { $round: ['$totalAmountConverted', 2] },
          uniqueCurrencyPairs: { $size: '$uniqueCurrencyPairs' },
          avgConversionAmount: { $round: ['$avgConversionAmount', 2] },
          lastConversion: 1,
          firstConversion: 1,
          _id: 0
        }
      }
    ]);

    return stats[0] || {
      totalConversions: 0,
      totalAmountConverted: 0,
      uniqueCurrencyPairs: 0,
      avgConversionAmount: 0,
      lastConversion: null,
      firstConversion: null
    };
  }
}
