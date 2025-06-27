// src/config/database.ts - CLEAN VERSION
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
 try {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
   throw new Error('MongoDB URI is not defined in environment variables');
  }

  console.log('Connecting to MongoDB...');

  const conn = await mongoose.connect(mongoUri);

  console.log(`MongoDB Connected: ${conn.connection.host}`);

 } catch (error) {
  console.error('Database connection failed:', error);
  throw error; // Re-throw to be caught by the caller
 }
};