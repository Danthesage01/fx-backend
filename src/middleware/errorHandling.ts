
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';

export const globalErrorHandler = (
 err: any,
 req: Request,
 res: Response,
 next: NextFunction
) => {
 err.statusCode = err.statusCode || 500;
 err.status = err.status || 'error';

 // Log error in development
 if (process.env.NODE_ENV === 'development') {
  console.error('ERROR:', err);
 }

 // Handle specific MongoDB errors
 if (err.name === 'CastError') {
  const message = 'Invalid resource ID';
  err = new AppError(message, 400);
 }

 if (err.code === 11000) {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  err = new AppError(message, 400);
 }

 if (err.name === 'ValidationError') {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const message = `Validation Error: ${errors.join('. ')}`;
  err = new AppError(message, 400);
 }

 // Send error response
 if (process.env.NODE_ENV === 'development') {
  res.status(err.statusCode).json({
   success: false,
   error: err.message,
   stack: err.stack,
   details: err
  });
 } else {
  // Production error response
  if (err.isOperational) {
   res.status(err.statusCode).json({
    success: false,
    error: err.message
   });
  } else {
   // Don't leak error details in production
   console.error('ERROR:', err);
   res.status(500).json({
    success: false,
    error: 'Something went wrong!'
   });
  }
 }
};