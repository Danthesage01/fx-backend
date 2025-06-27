// src/types/pagination.ts
export interface PaginationOptions {
 page?: number;
 limit?: number;
 sortBy?: string;
 sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
 data: T[];
 pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
 };
}

export interface PaginationQuery {
 page?: string;
 limit?: string;
 sortBy?: string;
 sortOrder?: 'asc' | 'desc';
}