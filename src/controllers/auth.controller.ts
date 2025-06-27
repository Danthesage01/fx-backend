
// // src/controllers/auth.controller.ts - UPDATED WITH OAUTH
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import { JWTService } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { EventLogger } from '../services/event.service';
import { IUser } from '../models';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

export class AuthController {
 // Existing methods remain the same...
 static register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
   const result = await AuthService.register({
    email,
    password,
    name
   });

   // Log registration event
   await EventLogger.log(
    'USER_REGISTERED', // Use uppercase format that matches your enum
    result.user._id.toString(),
    {
     email,
     registrationMethod: 'local',
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   // Wrap AuthResponse in ServiceResponse format
   res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 500).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Registration failed'
   });
  }
 });

 static login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
   const result = await AuthService.login({ email, password });

   // Log login event
   await EventLogger.log(
    'USER_LOGIN', // Use uppercase format
    result.user._id.toString(),
    {
     email,
     loginMethod: 'local',
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   // Wrap AuthResponse in ServiceResponse format
   res.json({
    success: true,
    message: 'Login successful',
    data: result
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 401).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Login failed'
   });
  }
 });

 // NEW: Google OAuth initiation
 static googleAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('google', {
   scope: ['profile', 'email']
  })(req, res, next);
 };

 // NEW: Google OAuth callback
 static googleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  return new Promise<void>((resolve) => {
   passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    try {
     if (err) {
      console.error('Google OAuth error:', err);
      res.redirect(`${process.env.FRONTEND_ERROR_URL}?error=oauth_error`);
      return resolve();
     }

     if (!user) {
      console.error('Google OAuth: No user returned');
      res.redirect(`${process.env.FRONTEND_ERROR_URL}?error=auth_failed`);
      return resolve();
     }

     // Generate JWT tokens for the OAuth user
     const tokens = JWTService.generateTokenPair({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email
     });

     // Log OAuth login event
     await EventLogger.log(
      'user_login',
      (user._id as Types.ObjectId).toString(),
      {
       email: user.email,
       loginMethod: 'google_oauth',
       provider: 'google',
       ipAddress: req.ip,
       userAgent: req.get('User-Agent')
      }
     );

     // Create user object for frontend
     const userForFrontend = {
      _id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
     };

     // Redirect to frontend with tokens
     const successUrl = new URL(process.env.FRONTEND_SUCCESS_URL!);
     successUrl.searchParams.set('access_token', tokens.accessToken);
     successUrl.searchParams.set('refresh_token', tokens.refreshToken);
     successUrl.searchParams.set('user', JSON.stringify(userForFrontend));

     res.redirect(successUrl.toString());
     resolve();
    } catch (error) {
     console.error('Google callback error:', error);
     res.redirect(`${process.env.FRONTEND_ERROR_URL}?error=callback_error`);
     resolve();
    }
   })(req, res);
  });
 });

 // NEW: Get OAuth user info
 static getOAuthUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  res.json({
   success: true,
   data: {
    user: user,
    authMethod: user.provider,
    isEmailVerified: user.isEmailVerified
   }
  });
 });

 // Existing methods (getProfile, updateProfile, etc.) remain the same...
 static getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  res.json({
   success: true,
   data: {
    user: user,
    authMethod: user.provider,
    isEmailVerified: user.isEmailVerified
   }
  });
 });

 static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;
  const { name, avatar } = req.body;

  try {
   const updatedUser = await AuthService.updateProfile((user._id as Types.ObjectId).toString(), { name });

   if (!updatedUser) {
    res.status(404).json({
     success: false,
     error: 'User not found'
    });
    return
   }

   // Log profile update event
   await EventLogger.log(
    'PROFILE_UPDATED', // Use uppercase format
    (user._id as Types.ObjectId).toString(),
    {
     updatedFields: Object.keys(req.body),
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 500).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Profile update failed'
   });
  }
 });

 static changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;
  const { currentPassword, newPassword } = req.body;

  // Check if user can change password (local auth only)
  if (user.provider && user.provider !== 'local') {
   res.status(400).json({
    success: false,
    error: 'Password change not available for OAuth users',
    message: 'Users who signed in with Google cannot change their password'
   });
   return;
  }

  try {
   await AuthService.changePassword((user._id as Types.ObjectId).toString(), currentPassword, newPassword);

   // Log password change event
   await EventLogger.log(
    'PASSWORD_CHANGED', // Use uppercase format
    (user._id as Types.ObjectId).toString(),
    {
     method: 'manual',
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   res.json({
    success: true,
    message: 'Password changed successfully'
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 500).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Password change failed'
   });
  }
 });

 static refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
   // Fix: Call refreshTokens (plural) method from AuthService
   const tokens = await AuthService.refreshTokens(refreshToken);

   // AuthService.refreshTokens returns AuthTokens, so wrap in ServiceResponse
   res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: { tokens }
   });
  } catch (error) {
   res.status(401).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Invalid or expired refresh token'
   });
  }
 });

 static logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { refreshToken } = req.body;

  try {
   await AuthService.logout((user._id as Types.ObjectId).toString(), refreshToken);

   // Log logout event
   await EventLogger.log(
    'USER_LOGOUT', // Use uppercase format
    (user._id as Types.ObjectId).toString(),
    {
     method: 'single_device',
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   res.json({
    success: true,
    message: 'Logged out successfully'
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 500).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Logout failed'
   });
  }
 });

 static logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
   await AuthService.revokeUserRefreshTokens((user._id as Types.ObjectId).toString());

   // Log logout all event
   await EventLogger.log(
    'USER_LOGOUT_ALL', // Use uppercase format
    (user._id as Types.ObjectId).toString(),
    {
     method: 'all_devices',
     ipAddress: req.ip,
     userAgent: req.get('User-Agent')
    }
   );

   res.json({
    success: true,
    message: 'Logged out from all devices successfully'
   });
  } catch (error) {
   res.status(error instanceof AppError ? error.statusCode : 500).json({
    success: false,
    error: error instanceof AppError ? error.message : 'Logout all failed'
   });
  }
 });
}