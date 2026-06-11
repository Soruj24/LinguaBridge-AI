import { Request } from 'express';
import { Types } from "mongoose";
import { UserAction } from './enums';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  image?: string;
  isBanned?: boolean;
  emailVerifiedAt?: Date;
  twoFactorAuth?: {
    enabled: boolean;
    enabledAt?: Date;
  };
  address?: {
    type: string;
    location?: {
      country: string;
      city: string;
    };
  };
  preferences?: {
    language: string;
    currency: string;
    theme: string;
  };
  isOnline: boolean;
  isModified: boolean;
  lastSeen: Date;
  socketId?: string;
  contacts: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  activityLog: ActivityLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLogEntry {
  action: UserAction;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export interface UserParams {
  id: string;
  userId: string;
  email?: string;
  password: string
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  location?: {
    country?: string;
    city?: string;
  };
  preferences?: {
    language?: string;
    currency?: string;
    theme?: string;
  };
  role?: string;
  permissions?: string[];
  status?: string;
  isActive?: boolean;
  isBanned?: boolean;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: {
    [key: string]: any;
  };
}

export interface PasswordChangeBody {
  oldPassword: string;
  newPassword: string;
}

export interface TwoFactorAuth {
  backupCodes: string[];
}

export interface CreateUserBody {
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  userLanguage: string;
  password: string;
  socketId: string;
  gender: string;
  dateOfBirth?: string;
  addresses?: any[];
  preferences?: any;
}
