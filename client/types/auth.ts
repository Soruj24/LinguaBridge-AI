export type UserRole = "user" | "admin" | "moderator" | "super_admin" | "premium";

export interface UserPreferences {
  lowBandwidth: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  autoPlayAudio: boolean;
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
