import { Document, Types } from "mongoose";

export interface IChatNotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: "system" | "message" | "friend_request" | "security" | "admin" | "chat";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserStatus extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  isOnline: boolean;
  lastSeen: Date;
  typingIn?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginActivity extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  type: "login" | "logout" | "signup" | "password_change" | "2fa_enabled" | "2fa_disabled";
  success: boolean;
  failureReason?: string;
  provider?: "credentials" | "google" | "github" | "apple";
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
