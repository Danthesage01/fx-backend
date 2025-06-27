// src/validators/common.validator.ts
import { z } from 'zod';

export const paginationQuerySchema = z.object({
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
 sortBy: z.string().optional(),
 sortOrder: z.enum(['asc', 'desc']).optional()
});

export const dateRangeQuerySchema = z.object({
 startDate: z
  .string()
  .datetime('Invalid start date format. Use ISO 8601 format')
  .optional(),
 endDate: z
  .string()
  .datetime('Invalid end date format. Use ISO 8601 format')
  .optional()
}).refine(
 (data) => {
  if (data.startDate && data.endDate) {
   return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
 },
 'Start date must be before or equal to end date'
);

export const mongoIdSchema = z.object({
 id: z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
});

// Custom validation helpers
export const createValidationMessage = (field: string, rule: string) => {
 const messages: Record<string, string> = {
  required: `${field} is required`,
  email: `${field} must be a valid email address`,
  min: `${field} is too short`,
  max: `${field} is too long`,
  positive: `${field} must be positive`,
  currency: `${field} must be a valid 3-letter currency code`
 };

 return messages[rule] || `${field} is invalid`;
};

// Validation error formatter
export const formatValidationErrors = (errors: z.ZodError) => {
 return errors.errors.map(err => ({
  field: err.path.join('.'),
  message: err.message,
  code: err.code
 }));
};
