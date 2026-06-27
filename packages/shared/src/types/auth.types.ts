export type UserRole = "user" | "admin" | "moderator" | "super_admin" | "premium";

export type Theme = "light" | "dark" | "auto";

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type UserStatus = "active" | "inactive" | "pending" | "suspended" | "deleted";

export interface UserPreferences {
  lowBandwidth: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  autoPlayAudio: boolean;
}

export interface EmailPreferences {
  marketing: boolean;
  security: boolean;
}

export type LoginActivityType =
  | "login"
  | "logout"
  | "signup"
  | "password_change"
  | "2fa_enabled"
  | "2fa_disabled";

export interface LoginActivityParams {
  userId?: string;
  email: string;
  userAgent?: string;
  type: LoginActivityType;
  success: boolean;
  failureReason?: string;
  provider?: string;
}

export interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

export interface LoginActivity {
  _id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  type: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
}

export interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}
