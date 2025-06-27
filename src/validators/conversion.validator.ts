// src/validators/conversion.validator.ts
import { z } from 'zod';

// Common currency codes for validation
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'NGN', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
  'ZAR', 'KES', 'GHS', 'EGP', 'MAD', 'TND', 'BWP', 'MUR', 'XOF', 'XAF'
];

export const createConversionSchema = z.object({
  body: z.object({
    fromCurrency: z
      .string()
      .length(3, 'Currency code must be exactly 3 characters')
      .transform(str => str.toUpperCase())
      .refine(
        (val) => SUPPORTED_CURRENCIES.includes(val),
        'Unsupported source currency'
      ),
    toCurrency: z
      .string()
      .length(3, 'Currency code must be exactly 3 characters')
      .transform(str => str.toUpperCase())
      .refine(
        (val) => SUPPORTED_CURRENCIES.includes(val),
        'Unsupported target currency'
      ),
    amount: z
      .number()
      .positive('Amount must be greater than 0')
      .max(1000000, 'Amount cannot exceed 1,000,000')
      .multipleOf(0.01, 'Amount cannot have more than 2 decimal places')
  }).refine(
    (data) => data.fromCurrency !== data.toCurrency,
    'Source and target currencies cannot be the same'
  )
});

export const getConversionsSchema = z.object({
  query: z.object({
    fromCurrency: z
      .string()
      .length(3)
      .transform(str => str.toUpperCase())
      .optional(),
    toCurrency: z
      .string()
      .length(3)
      .transform(str => str.toUpperCase())
      .optional(),
    startDate: z
      .string()
      .datetime('Invalid start date format. Use ISO 8601 format')
      .optional(),
    endDate: z
      .string()
      .datetime('Invalid end date format. Use ISO 8601 format')
      .optional(),
    page: z
      .string()
      .transform(Number)
      .refine((val) => val > 0, 'Page must be greater than 0')
      .optional(),
    limit: z
      .string()
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional(),
    sortBy: z
      .enum(['createdAt', 'amount', 'convertedAmount', 'fromCurrency', 'toCurrency'])
      .optional(),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    'Start date must be before or equal to end date'
  )
});

export const getConversionByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversion ID format')
  })
});

export const deleteConversionSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversion ID format')
  })
});


export const getExchangeRateParamsSchema = z
  .object({
    from: z.string().length(3).transform(str => str.toUpperCase()),
    to: z.string().length(3).transform(str => str.toUpperCase())
  })
  .refine(data => data.from !== data.to, {
    message: 'Source and target currencies cannot be the same',
    path: ['to']
  });
