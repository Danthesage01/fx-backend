
// src/models/Event.ts - UPDATED
import mongoose, { Schema } from 'mongoose';
import { IEvent, EventType } from '../types';

const EventSchema = new Schema<IEvent>({
 userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: false, // Allow null for unknown users
  index: true
 },
 eventType: {
  type: String,
  required: [true, 'Event type is required'],
  enum: Object.values(EventType),
  index: true
 },
 entityId: {
  type: Schema.Types.ObjectId,
  required: false // Optional - for linking to specific entities like conversions
 },
 metadata: {
  type: Schema.Types.Mixed,
  default: {}
 },
 timestamp: {
  type: Date,
  default: Date.now,
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
EventSchema.index({ userId: 1, timestamp: -1 });
EventSchema.index({ eventType: 1, timestamp: -1 });

// TTL index - auto-delete events older than 90 days (optional)
EventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Event = mongoose.model<IEvent>('Event', EventSchema);
