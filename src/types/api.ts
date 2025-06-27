
// src/types/api.ts
export interface ApiResponse<T = any> {
 success: boolean;
 data?: T;
 message?: string;
 error?: string;
 errors?: any[];
}

export interface ApiError {
 message: string;
 statusCode: number;
 isOperational?: boolean;
}