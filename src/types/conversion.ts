
// src/types/conversion.ts
import { Types } from 'mongoose';

export interface IConversion {
 _id: string;
 userId: Types.ObjectId;
 fromCurrency: string;
 toCurrency: string;
 amount: number;
 rate: number;
 convertedAmount: number;
 createdAt: Date;
 updatedAt: Date;
}

export interface CreateConversionRequest {
 fromCurrency: string;
 toCurrency: string;
 amount: number;
}

export interface ConversionFilters {
 fromCurrency?: string;
 toCurrency?: string;
 startDate?: string;
 endDate?: string;
}

export interface ConversionSummary {
 _id: string;
 totalAmount: number;
 count: number;
 currency: string;
}

export interface ExchangeRateResponse {
 success: boolean;
 rates: Record<string, number>;
 base: string;
 date: string;
}


