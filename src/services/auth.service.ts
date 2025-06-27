// ================================
// src/services/auth.service.ts - UPDATED WITH REFRESH TOKENS
import { User, RefreshToken } from '../models';
import { IUser, LoginRequest, RegisterRequest } from '../types';
import { AppError } from '../utils/AppError';
import { JWTService } from '../utils/jwt';
import { EventLogger } from './event.service';
import { Types } from 'mongoose';

export interface AuthTokens {
 accessToken: string;
 refreshToken: string;
 expiresIn: number; // seconds
}

export interface AuthResponse {
 user: IUser;
 tokens: AuthTokens;
}

export class AuthService {
 static async register(userData: RegisterRequest): Promise<AuthResponse> {
  const { email, password, name } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
   throw new AppError('User with this email already exists', 409);
  }

  // Create user
  const userDoc = await User.create({
   email: email.toLowerCase(),
   password,
   name: name.trim()
  });

  // Convert to plain object with proper ObjectId
  const user: IUser = {
   _id: userDoc._id as Types.ObjectId,
   email: userDoc.email,
   // password: userDoc.password,
   name: userDoc.name,
   createdAt: userDoc.createdAt,
   updatedAt: userDoc.updatedAt
  };

  // Generate token pair
  const tokens = await this.generateTokensForUser(user);

  // Log registration event
  await EventLogger.log('USER_REGISTERED', (userDoc._id as Types.ObjectId).toString(), {
   email: user.email,
   name: user.name
  });

  return { user, tokens };
 }

 static async login(
  loginData: LoginRequest,
  metadata: { ipAddress?: string; userAgent?: string } = {}
 ): Promise<AuthResponse> {
  const { email, password } = loginData;

  // Find user and include password field
  const userDoc = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!userDoc) {
   // Log failed login attempt
   await EventLogger.log('FAILED_LOGIN', 'unknown', {
    email: email.toLowerCase(),
    reason: 'User not found',
    ...metadata
   });
   throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await userDoc.comparePassword(password);
  if (!isPasswordValid) {
   // Log failed login attempt
   await EventLogger.log('FAILED_LOGIN', (userDoc._id as Types.ObjectId).toString(), {
    email: userDoc.email,
    reason: 'Invalid password',
    ...metadata
   });
   throw new AppError('Invalid email or password', 401);
  }

  // Convert to plain object
  const user: IUser = {
   _id: userDoc._id as Types.ObjectId,
   email: userDoc.email,
   name: userDoc.name,
   createdAt: userDoc.createdAt,
   updatedAt: userDoc.updatedAt
  };

  // Revoke existing refresh tokens (optional - for single session)
  // await this.revokeUserRefreshTokens(user._id.toString());

  // Generate new token pair
  const tokens = await this.generateTokensForUser(user);

  // Log successful login
  await EventLogger.log('USER_LOGIN', (userDoc._id as Types.ObjectId).toString(), {
   email: user.email,
   ...metadata
  });

  return { user, tokens };
 }

 static async refreshTokens(refreshTokenString: string): Promise<AuthTokens> {
  // Find the refresh token
  const refreshTokenDoc = await RefreshToken.findOne({
   token: refreshTokenString,
   isRevoked: false,
   expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!refreshTokenDoc) {
   throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = refreshTokenDoc.userId as any;
  if (!user) {
   throw new AppError('User not found', 404);
  }

  // Revoke the used refresh token
  refreshTokenDoc.isRevoked = true;
  await refreshTokenDoc.save();

  // Generate new token pair
  const tokens = await this.generateTokensForUser({
   _id: user._id,
   email: user.email,
   password: user.password,
   name: user.name,
   createdAt: user.createdAt,
   updatedAt: user.updatedAt
  });

  // Log refresh event
  await EventLogger.log('TOKEN_REFRESHED', user._id.toString(), {
   oldTokenId: refreshTokenDoc._id
  });

  return tokens;
 }

 static async logout(userId: string, refreshTokenString?: string): Promise<void> {
  if (refreshTokenString) {
   // Revoke specific refresh token
   await RefreshToken.updateOne(
    { token: refreshTokenString, userId: new Types.ObjectId(userId) },
    { isRevoked: true }
   );
  } else {
   // Revoke all user's refresh tokens
   await this.revokeUserRefreshTokens(userId);
  }

  await EventLogger.log('USER_LOGOUT', userId, {
   revokedToken: !!refreshTokenString
  });
 }

 static async revokeUserRefreshTokens(userId: string): Promise<void> {
  await RefreshToken.updateMany(
   { userId: new Types.ObjectId(userId), isRevoked: false },
   { isRevoked: true }
  );
 }

 private static async generateTokensForUser(user: IUser): Promise<AuthTokens> {
  const payload = {
   userId: user._id.toString(),
   email: user.email
  };

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = JWTService.generateTokenPair(payload);

  // Store refresh token in database
  const expiresAt = new Date();
  const refreshExpiryDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7');
  expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

  await RefreshToken.create({
   userId: user._id,
   token: refreshToken,
   expiresAt,
   isRevoked: false
  });

  const accessExpiryMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '15');

  return {
   accessToken,
   refreshToken,
   expiresIn: accessExpiryMinutes * 60 // Convert to seconds
  };
 }

 // ... rest of your existing methods remain the same
 static async getUserProfile(userId: string): Promise<IUser | null> {
  const userDoc = await User.findById(userId);
  if (!userDoc) return null;

  return {
   _id: userDoc._id as Types.ObjectId,
   email: userDoc.email,
   // password: userDoc.password,
   name: userDoc.name,
   createdAt: userDoc.createdAt,
   updatedAt: userDoc.updatedAt
  };
 }

 static async updateProfile(
  userId: string,
  updateData: { name?: string; email?: string }
 ): Promise<IUser | null> {
  const userDoc = await User.findByIdAndUpdate(
   userId,
   { ...updateData },
   { new: true, runValidators: true }
  );

  if (!userDoc) return null;

  await EventLogger.log('PROFILE_UPDATED', userId, updateData);

  return {
   _id: userDoc._id as Types.ObjectId,
   email: userDoc.email,
   // password: userDoc.password,
   name: userDoc.name,
   createdAt: userDoc.createdAt,
   updatedAt: userDoc.updatedAt
  };
 }

 static async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
 ): Promise<void> {
  const userDoc = await User.findById(userId).select('+password');
  if (!userDoc) {
   throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await userDoc.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
   throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  userDoc.password = newPassword;
  await userDoc.save();

  // Revoke all refresh tokens when password changes
  await this.revokeUserRefreshTokens(userId);

  await EventLogger.log('PASSWORD_CHANGED', userId, {
   revokedAllTokens: true
  });
 }
}