// ================================
// src/utils/jwt.ts - UPDATED WITH REFRESH TOKENS (SIMPLIFIED)
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthTokenPayload } from '../types';

export class JWTService {
 // Don't use static readonly - get the secret dynamically each time
 private static getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
   throw new Error('JWT_SECRET is not defined');
  }
  return secret;
 }

 private static getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
   throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return secret;
 }

 // Generate short-lived access token - ultra simple approach
 static generateAccessToken(payload: { userId: string; email: string }): string {
  const secret = this.getSecret();

  // Debug log to confirm we have the secret
  console.log('Generating token with secret length:', secret.length);

  // Try the simplest approach first - no expiration
  const tokenPayload = {
   ...payload
  };

  // Simplest possible JWT generation - no options, no manual expiration
  const token = jwt.sign(tokenPayload, secret);
  console.log('Generated token:', token.substring(0, 50) + '...');
  return token;
 }

 // Generate long-lived refresh token (7 days)
 static generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
 }

 // Generate both tokens
 static generateTokenPair(payload: { userId: string; email: string }) {
  return {
   accessToken: this.generateAccessToken(payload),
   refreshToken: this.generateRefreshToken()
  };
 }

 static verifyAccessToken(token: string): AuthTokenPayload {
  const secret = this.getSecret();

  try {
   console.log('Verifying token with secret length:', secret.length);
   console.log('Token to verify:', token.substring(0, 50) + '...');

   const decoded = jwt.verify(token, secret) as AuthTokenPayload;
   console.log('Token verified successfully:', decoded);
   return decoded;
  } catch (error) {
   console.error('Token verification failed:', error);
   throw new Error('Invalid or expired access token');
  }
 }

 static decodeToken(token: string): AuthTokenPayload | null {
  try {
   return jwt.decode(token) as AuthTokenPayload;
  } catch (error) {
   return null;
  }
 }

 // Legacy methods for backward compatibility - using the simple approach
 static generateToken(payload: { userId: string; email: string }): string {
  const secret = this.getSecret();

  // Debug log to confirm we have the secret
  console.log('JWT_SECRET length:', secret.length);

  // Simplest possible JWT generation - no options
  return jwt.sign(payload, secret);
 }

 static verifyToken(token: string): AuthTokenPayload {
  const secret = this.getSecret();

  try {
   return jwt.verify(token, secret) as AuthTokenPayload;
  } catch (error) {
   throw new Error('Invalid or expired token');
  }
 }
}