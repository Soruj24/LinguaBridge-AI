import { Document, Types } from "mongoose";

export interface IChatUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  preferredLanguage: string;
  showLastSeen: boolean;
  showTypingIndicator: boolean;
  showReadReceipts: boolean;
  theme: string;
  role: "user" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  emailPreferences: {
    marketing: boolean;
    security: boolean;
  };
  notificationPreferences: {
    enabledTypes: string[];
    doNotDisturb: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    sound: string;
    vibration: boolean;
    showPreview: boolean;
  };
  preferences: {
    lowBandwidth: boolean;
    reduceMotion: boolean;
    highContrast: boolean;
    autoPlayAudio: boolean;
  };
  loginAttempts?: number;
  lockUntil?: Date;
  lastLogin?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}
