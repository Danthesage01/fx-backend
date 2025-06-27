// src/config/passport.ts - ROBUST VERSION
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User, IUser } from '../models';
import { AuthTokenPayload } from '../types';

// Function to get JWT secret dynamically
function getJwtSecret(): string {
 const secret = process.env.JWT_SECRET;
 if (!secret) {
  throw new Error('JWT_SECRET environment variable is required for Passport JWT strategy');
 }
 return secret;
}

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
 jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
 secretOrKey: getJwtSecret(), // Get secret dynamically
 issuer: 'fx-converter-api',
 audience: 'fx-converter-app'
}, async (payload: AuthTokenPayload, done) => {
 try {
  const user = await User.findById(payload.userId);
  if (user) {
   return done(null, user);
  }
  return done(null, false);
 } catch (error) {
  return done(error, false);
 }
}));


// Google OAuth Strategy
passport.use(new GoogleStrategy({
 clientID: process.env.GOOGLE_CLIENT_ID!,
 clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 callbackURL: process.env.GOOGLE_CALLBACK_URL!,
 scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
 try {
  console.log('Google OAuth callback received:', {
   id: profile.id,
   email: profile.emails?.[0]?.value,
   name: profile.displayName
  });

  // Check if user already exists with this Google ID
  let user = await User.findOne({ googleId: profile.id, provider: 'google' });

  if (user) {
   console.log('Existing Google user found:', user.email);
   // Update last login
   user.lastLoginAt = new Date();
   await user.save();
   return done(null, user);
  }

  // Check if user exists with same email (different provider)
  const existingEmailUser = await User.findOne({
   email: profile.emails?.[0]?.value
  });

  if (existingEmailUser) {
   console.log('User exists with same email, different provider');
   // Link Google account to existing user
   existingEmailUser.googleId = profile.id;
   existingEmailUser.provider = 'google'; // Convert to Google auth
   existingEmailUser.isEmailVerified = true;
   existingEmailUser.lastLoginAt = new Date();

   // Update avatar if not set
   if (!existingEmailUser.avatar && profile.photos?.[0]?.value) {
    existingEmailUser.avatar = profile.photos[0].value;
   }

   await existingEmailUser.save();
   return done(null, existingEmailUser);
  }

  // Create new user
  const newUser = new User({
   googleId: profile.id,
   email: profile.emails?.[0]?.value,
   name: profile.displayName || profile.name?.givenName || 'Google User',
   avatar: profile.photos?.[0]?.value,
   provider: 'google',
   isEmailVerified: true,
   lastLoginAt: new Date()
  });

  await newUser.save();
  console.log('New Google user created:', newUser.email);

  return done(null, newUser);
 } catch (error) {
  console.error('Google OAuth error:', error);
  return done(error as Error, undefined);
 }
}));

// Serialize user for session (needed even if not using sessions)
passport.serializeUser((user: any, done) => {
 done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
 try {
  const user = await User.findById(id);
  done(null, user);
 } catch (error) {
  done(error, null);
 }
});

export default passport;