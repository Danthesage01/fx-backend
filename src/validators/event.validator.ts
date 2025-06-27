
// src/validators/event.validator.ts
import { z } from 'zod';

export const getEventsSchema = z.object({
 query: z.object({
  eventType: z
   .string()
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