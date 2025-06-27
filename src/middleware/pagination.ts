// src/middleware/pagination.ts - FIXED VERSION
import { Request, Response, NextFunction } from 'express';
import { PaginationOptions } from '../types';

// Extend Express Request interface to include pagination
declare global {
 namespace Express {
  interface Request {
   pagination?: PaginationOptions;
  }
 }
}

export const paginationMiddleware = (
 req: Request,
 res: Response,
 next: NextFunction
) => {
 const page = parseInt(req.query.page as string) || 1;
 const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
 const sortBy = req.query.sortBy as string;
 const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

 req.pagination = {
  page: Math.max(1, page),
  limit: Math.max(1, limit),
  sortBy,
  sortOrder
 };

 next();
};