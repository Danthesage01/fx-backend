
// ================================
// src/middleware/auth.ts - FINAL TYPE FIX
import { Response, NextFunction } from 'express';
import { User } from '../models';
import { AuthRequest, IUser } from '../types';
import { JWTService, AppError, asyncHandler } from '../utils';

import { Types } from 'mongoose';

export const authenticateToken = asyncHandler(
 async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
   ? authHeader.substring(7)
   : null;

  if (!token) {
   throw new AppError('Access token is required', 401);
  }

  try {
   // Verify token
   const decoded = JWTService.verifyToken(token);

   // Check if user still exists
   const userDoc = await User.findById(decoded.userId).select('+password');
   if (!userDoc) {
    throw new AppError('User associated with this token no longer exists', 401);
   }

   // Convert to IUser type with proper ObjectId casting
   const user: IUser = {
    _id: userDoc._id as Types.ObjectId,
    email: userDoc.email,
    password: userDoc.password,
    name: userDoc.name,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt
   };

   // Add user to request object
   req.user = user;
   next();
  } catch (error) {
   throw new AppError('Invalid or expired token', 401);
  }
 }
);