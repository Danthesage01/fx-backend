// src/types/event.ts - COMPLETE ENUM
import { Types } from 'mongoose';

export interface IEvent {
 _id: string;
 userId: Types.ObjectId | null;
 eventType: EventType;
 entityId?: Types.ObjectId;
 metadata: Record<string, any>;
 timestamp: Date;
}

export enum EventType {
 // User Authentication Events
 USER_REGISTERED = 'USER_REGISTERED',
 USER_LOGIN = 'USER_LOGIN',
 USER_LOGOUT = 'USER_LOGOUT',
 USER_LOGOUT_ALL = 'USER_LOGOUT_ALL',
 FAILED_LOGIN = 'FAILED_LOGIN',

 // User Profile Events  
 PROFILE_UPDATED = 'PROFILE_UPDATED',
 PASSWORD_CHANGED = 'PASSWORD_CHANGED',

 // Token Events
 TOKEN_REFRESHED = 'TOKEN_REFRESHED',

 // Conversion Events
 CONVERSION_CREATED = 'CONVERSION_CREATED',
 CONVERSION_DELETED = 'CONVERSION_DELETED',

 // System Events
 RATE_FETCHED = 'RATE_FETCHED',
 DASHBOARD_VIEWED = 'DASHBOARD_VIEWED'
}