
// src/utils/pagination.ts
import { PaginationOptions, PaginatedResult } from '../types';

export class PaginationService {
 static async paginate<T>(
  model: any,
  query: any = {},
  options: PaginationOptions = {}
 ): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  // Build sort object
  const sort: any = {};
  if (options.sortBy) {
   sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
  } else {
   sort.createdAt = -1; // Default sort by creation date
  }

  // Execute queries in parallel for better performance
  const [data, total] = await Promise.all([
   model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email') // Populate user info if needed
    .lean()
    .exec(),
   model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
   data,
   pagination: {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
   }
  };
 }
}
