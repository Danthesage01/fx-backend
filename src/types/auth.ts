
// ================================
// src/types/auth.ts - FIXED TYPES
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { PaginationOptions } from './pagination';
import { Types } from 'mongoose';

export interface IUser {
 _id: Types.ObjectId;
 email: string;
 password?: string;
 name: string;
 createdAt: Date;
 updatedAt: Date;
}

export interface IUserResponse {
 _id: string;
 email: string;
 name: string;
 createdAt: Date;
}

export interface LoginRequest {
 email: string;
 password: string;
}

export interface RegisterRequest {
 email: string;
 password: string;
 name: string;
}

export interface AuthTokenPayload extends JwtPayload {
 userId: string;
 email: string;
}

export interface AuthRequest extends Request {
 user?: IUser;
 pagination?: PaginationOptions;
}
