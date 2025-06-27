// ================================
// src/routes/auth.routes.ts - UPDATED WITH REFRESH TOKEN ROUTES
import { Router } from 'express';
import { AuthController } from '../controllers';
import { validate, authenticateToken } from '../middleware';
import {
 registerSchema,
 loginSchema,
 refreshTokenSchema,
 updateProfileSchema,
 changePasswordSchema,
 logoutSchema
} from '../validators';

const router = Router();

// Check for 404 BEFORE any other middleware
router.use((req, res, next) => {
 const validPaths = [
  '/register',
  '/login',
  '/refresh-token',
  '/profile',
  '/change-password',
  '/logout',
  '/logout-all'
 ];

 const isValidPath = validPaths.some(path => req.path === path);

 if (!isValidPath) {
  console.log(`Auth 404: ${req.method} ${req.path} not found`);
  return res.status(404).json({
   success: false,
   error: `Auth route ${req.originalUrl} not found`,
   message: `Cannot ${req.method} ${req.originalUrl}`,
   availableRoutes: [
    'POST /api/v1/auth/register',
    'POST /api/v1/auth/login',
    'POST /api/v1/auth/refresh-token',
    'GET /api/v1/auth/profile',
    'PUT /api/v1/auth/profile',
    'POST /api/v1/auth/change-password',
    'POST /api/v1/auth/logout',
    'POST /api/v1/auth/logout-all'
   ]
  });
 }

 console.log(`Auth route found: ${req.method} ${req.path}`);
 return next(); // Add explicit return here
});

// Public routes (no auth required)
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

// Protected routes (auth required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, validate(updateProfileSchema), AuthController.updateProfile);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);
router.post('/logout', authenticateToken, validate(logoutSchema), AuthController.logout);
router.post('/logout-all', authenticateToken, AuthController.logoutAll);

export { router as authRoutes };