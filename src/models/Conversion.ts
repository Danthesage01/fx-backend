
// src/models/Conversion.ts
import mongoose, { Schema, Types } from 'mongoose';
import { IConversion } from '../types';

const ConversionSchema = new Schema<IConversion>({
 userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: [true, 'User ID is required'],
  index: true
 },
 fromCurrency: {
  type: String,
  required: [true, 'From currency is required'],
  uppercase: true,
  length: [3, 'Currency code must be exactly 3 characters'],
  match: [/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters']
 },
 toCurrency: {
  type: String,
  required: [true, 'To currency is required'],
  uppercase: true,
  length: [3, 'Currency code must be exactly 3 characters'],
  match: [/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters']
 },
 amount: {
  type: Number,
  required: [true, 'Amount is required'],
  min: [0.01, 'Amount must be greater than 0'],
  max: [1000000, 'Amount cannot exceed 1,000,000']
 },
 rate: {
  type: Number,
  required: [true, 'Exchange rate is required'],
  min: [0, 'Rate must be positive']
 },
 convertedAmount: {
  type: Number,
  required: [true, 'Converted amount is required'],
  min: [0, 'Converted amount must be positive']
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
ConversionSchema.index({ userId: 1, createdAt: -1 });
ConversionSchema.index({ fromCurrency: 1, toCurrency: 1 });
ConversionSchema.index({ createdAt: -1 });

// Validation to prevent same currency conversion
ConversionSchema.pre('save', function (next) {
 if (this.fromCurrency === this.toCurrency) {
  next(new Error('From and To currencies cannot be the same'));
 } else {
  next();
 }
});

export const Conversion = mongoose.model<IConversion>('Conversion', ConversionSchema);
