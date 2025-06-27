// src/models/RefreshToken.ts - NEW MODEL
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRefreshToken {
 _id: Types.ObjectId;
 userId: Types.ObjectId;
 token: string;
 expiresAt: Date;
 isRevoked: boolean;
 createdAt: Date;
 updatedAt: Date;
}

interface IRefreshTokenDocument extends Omit<IRefreshToken, '_id'>, Document { }

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>({
 userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: [true, 'User ID is required'],
  index: true
 },
 token: {
  type: String,
  required: [true, 'Token is required'],
  unique: true,
  index: true
 },
 expiresAt: {
  type: Date,
  required: [true, 'Expiration date is required'],
  index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
 },
 isRevoked: {
  type: Boolean,
  default: false,
  index: true
 }
}, {
 timestamps: true,
 toJSON: {
  transform: function (doc, ret) {
   delete ret.__v;
   return ret;
  }
 }
});

// Indexes for performance
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ token: 1, isRevoked: 1 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);


