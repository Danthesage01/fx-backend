

// src/services/event.service.ts - UPDATED
import { Event } from '../models';
import { IEvent, EventType, PaginationOptions, PaginatedResult } from '../types';
import { PaginationService } from '../utils/pagination';
import { Types } from 'mongoose';

export class EventLogger {
 static async log(
  eventType: EventType | string,
  userId: string,
  metadata: Record<string, any> = {},
  entityId?: string
 ): Promise<IEvent> {
  try {
   const event = await Event.create({
    userId: userId === 'unknown' ? null : new Types.ObjectId(userId),
    eventType,
    entityId: entityId ? new Types.ObjectId(entityId) : undefined,
    metadata,
    timestamp: new Date()
   });

   return event;
  } catch (error) {
   // Don't throw errors for logging failures - just log to console
   console.error('Failed to log event:', error);
   throw error;
  }
 }

 static async getUserEvents(
  userId: string,
  filters: { eventType?: string; startDate?: string; endDate?: string } = {},
  pagination: PaginationOptions = {}
 ): Promise<PaginatedResult<IEvent>> {
  const query: any = { userId: new Types.ObjectId(userId) };

  if (filters.eventType) {
   query.eventType = filters.eventType;
  }

  if (filters.startDate || filters.endDate) {
   query.timestamp = {};
   if (filters.startDate) {
    query.timestamp.$gte = new Date(filters.startDate);
   }
   if (filters.endDate) {
    query.timestamp.$lte = new Date(filters.endDate);
   }
  }

  return await PaginationService.paginate<IEvent>(
   Event,
   query,
   { ...pagination, sortBy: 'timestamp', sortOrder: 'desc' }
  );
 }

 static async getEventStats(userId: string) {
  const stats = await Event.aggregate([
   { $match: { userId: new Types.ObjectId(userId) } },
   {
    $group: {
     _id: '$eventType',
     count: { $sum: 1 },
     lastOccurrence: { $max: '$timestamp' }
    }
   },
   { $sort: { count: -1 } }
  ]);

  return stats;
 }
}