// src/types/express.d.ts
import { IUser } from '../models/user.model';
import { PaginationOptions } from './pagination';

declare global {
 namespace Express {
  interface Request {
   user?: IUser;
   pagination?: PaginationOptions;
  }
 }
}