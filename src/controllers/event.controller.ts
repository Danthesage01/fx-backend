
// ================================
// src/controllers/event.controller.ts - FIXED ObjectId conversions
import { Response } from 'express';
import { EventLogger } from '../services';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export class EventController {
 static getEvents = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  const { eventType, startDate, endDate } = req.query;

  const filters = {
   eventType: eventType as string,
   startDate: startDate as string,
   endDate: endDate as string
  };

  const result = await EventLogger.getUserEvents(
   userId,
   filters,
   req.pagination
  );

  res.json({
   success: true,
   message: 'Events retrieved successfully',
   ...result
  });
 });

 static getEventStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();

  const stats = await EventLogger.getEventStats(userId);

  res.json({
   success: true,
   data: { stats }
  });
 });
}