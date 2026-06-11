import { Types } from "mongoose";
import { AddressType, ProfileVisibility, Theme } from "./enums";

export interface ILoginHistory {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  deviceInfo: string;
  location?: string;
  loginMethod?: "password" | "2fa" | "social" | "magic-link";
  success: boolean;
  failureReason?: string;
}

export interface ITwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  enabledAt?: Date;
  lastUsed?: Date;
  recoveryCodesUsed?: number;
}

export interface IAddress {
  type: AddressType;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  verified?: boolean;
}

export interface IAvatar {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
}

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
  social: boolean;
  system: boolean;
}

export interface IPrivacySettings {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowFriendRequests: boolean;
  allowDirectMessages: boolean;
  searchable: boolean;
}

export interface ISecuritySettings {
  requireTwoFactorForPasswordChange: boolean;
  requireTwoFactorForEmailChange: boolean;
  sessionTimeout: number;
  allowMultipleSessions: boolean;
  ipWhitelist?: string[];
  suspiciousActivityAlerts: boolean;
}

export interface IPreferences {
  notifications: INotificationPreferences;
  privacy: IPrivacySettings;
  security: ISecuritySettings;
  language: string;
  currency: string;
  timezone: string;
  theme: Theme;
  dateFormat: string;
  timeFormat: "12" | "24";
}

export interface IMetadata {
  userAgent?: string;
  referrer?: string;
  campaign?: string;
  source?: string;
  medium?: string;
  utmParameters?: Record<string, string>;
  deviceFingerprint?: string;
  initialCountry?: string;
  signupFlow?: string;
}
