// ================================
// src/validators/auth.validator.ts - UPDATED WITH REFRESH TOKEN VALIDATION
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(128, 'Password cannot exceed 128 characters'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'Password is required')
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token is required')
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim()
      .optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided'
  )
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .max(128, 'New password cannot exceed 128 characters')
  }).refine(
    (data) => data.currentPassword !== data.newPassword,
    'New password must be different from current password'
  )
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token is required')
      .optional()
  })
});