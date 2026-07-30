import mongoose, { Schema, model, Model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  PREMIUM = 'premium',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say',
}

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

export enum Permission {
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',
  ROLES_VIEW = 'roles:view',
  ROLES_EDIT = 'roles:edit',
  CONTENT_VIEW = 'content:view',
  CONTENT_CREATE = 'content:create',
  CONTENT_EDIT = 'content:edit',
  CONTENT_DELETE = 'content:delete',
  SYSTEM_VIEW = 'system:view',
  SYSTEM_SETTINGS = 'system:settings',
  ANALYTICS_VIEW = 'analytics:view',
  TICKETS_VIEW = 'tickets:view',
  TICKETS_EDIT = 'tickets:edit',
  BILLING_VIEW = 'billing:view',
  BILLING_EDIT = 'billing:edit',
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

// ═══════════════════════════════════════════════
// SUB-INTERFACES
// ═══════════════════════════════════════════════

export interface ILoginHistory {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  deviceInfo: string;
  location?: string;
  loginMethod?: 'password' | '2fa' | 'social' | 'magic-link';
  success: boolean;
  failureReason?: string;
}

export interface ITwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  method?: 'totp' | 'sms' | 'email';
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
  coordinates?: { latitude: number; longitude: number };
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
  timeFormat: '12' | '24';
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

// ═══════════════════════════════════════════════
// IUSER INTERFACE
// ═══════════════════════════════════════════════

export interface IUser {
  username: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: IAvatar;
  phone?: string;
  phoneVerified?: boolean;
  dateOfBirth?: Date;
  gender?: Gender;
  bio?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  status: UserStatus;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isOnline: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  googleId?: string;
  githubId?: string;
  facebookId?: string;
  socketId?: string;
  lastSeen: Date;
  lastLoginDevice?: string;
  userLanguage: string;
  timezone: string;
  registrationIP?: string;
  detectedCountry?: string;
  currentIP?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  friends: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  friendRequests?: { sent: Types.ObjectId[]; received: Types.ObjectId[] };
  loginHistory: ILoginHistory[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  phoneVerificationToken?: string;
  phoneVerificationExpires?: Date;
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockoutUntil?: Date;
  preferences: IPreferences;
  addresses: IAddress[];
  loginCount: number;
  lastLoginAt?: Date;
  accountCreatedAt: Date;
  metadata: IMetadata;
  subscription?: { plan: string; status: string; expiresAt?: Date; features: string[] };
  apiKeys?: Array<{ key: string; name: string; permissions: string[]; lastUsed?: Date; expiresAt?: Date; isActive: boolean }>;
  sessions?: Array<{ sessionId: string; deviceInfo: string; ipAddress: string; createdAt: Date; lastActivity: Date; isActive: boolean }>;
  auditLog?: Array<{ action: string; details: Record<string, any>; ipAddress?: string; userAgent?: string; timestamp: Date }>;
  twoFactorAuth?: ITwoFactorAuth;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════
// USER CONSTANTS
// ═══════════════════════════════════════════════

export const USER_CONSTANTS = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 120,
    RESERVED: [
      'administrator', 'root', 'system', 'null', 'undefined',
      'api', 'www', 'support', 'help', 'contact', 'test', 'moderator',
      'guest', 'anonymous', 'user', 'users', 'settings', 'config'
    ]
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    SALT_ROUNDS: 12,
    RESET_TOKEN_EXPIRY: 10 * 60 * 1000,
    CHANGED_THRESHOLD: 2 * 60 * 1000
  },
  LOCKOUT: {
    MAX_ATTEMPTS: 5,
    DURATION: 30 * 60 * 1000,
    PROGRESSIVE_DELAYS: [1, 2, 5, 10, 30]
  },
  VERIFICATION: {
    EMAIL_TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
    PHONE_TOKEN_EXPIRY: 5 * 60 * 1000,
    MAX_RESEND_ATTEMPTS: 3
  },
  LIMITS: {
    MAX_LOGIN_HISTORY: 50,
    MAX_ADDRESSES: 5,
    MAX_BACKUP_CODES: 10,
    BIO_MAX_LENGTH: 500,
    NAME_MAX_LENGTH: 50
  }
} as const;

// ═══════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
};

export const sanitizeUserAgent = (userAgent: string): string => {
  return userAgent.substring(0, 255);
};

export const getDeviceInfo = (userAgent: string): string => {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile';
  else if (/Tablet/.test(userAgent)) return 'Tablet';
  return 'Desktop';
};

export const validateTimezone = (tz: string): boolean => {
  try { Intl.DateTimeFormat(undefined, { timeZone: tz }); return true; }
  catch { return false; }
};

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export const getPasswordStrengthScore = (password: string): { score: number; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];
  if (password.length >= 8) score += 20;
  else feedback.push('Password should be at least 8 characters long');
  if (password.length >= 12) score += 10;
  else feedback.push('Consider using 12+ characters for better security');
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Include lowercase letters');
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Include uppercase letters');
  if (/\d/.test(password)) score += 15;
  else feedback.push('Include numbers');
  if (/[^a-zA-Z0-9]/.test(password)) score += 25;
  else feedback.push('Include special characters');
  return { score, feedback };
};

export const ValidationHelpers = {
  isValidUsername: (username: string): boolean => {
    return username.length >= USER_CONSTANTS.USERNAME.MIN_LENGTH &&
      username.length <= USER_CONSTANTS.USERNAME.MAX_LENGTH &&
      /^[a-zA-Z0-9_.-]+$/.test(username) &&
      !USER_CONSTANTS.USERNAME.RESERVED.includes(username.toLowerCase() as any);
  },
  sanitizeUserInput: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/[<>]/g, '').trim();
  },
  validateProfileData: (profileData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (profileData.firstName && profileData.firstName.length > USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH) errors.push('First name cannot exceed ' + USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH + ' characters');
    if (profileData.lastName && profileData.lastName.length > USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH) errors.push('Last name cannot exceed ' + USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH + ' characters');
    if (profileData.bio && profileData.bio.length > USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH) errors.push('Bio cannot exceed ' + USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH + ' characters');
    if (profileData.website && !validator.isURL(profileData.website)) errors.push('Website must be a valid URL');
    if (profileData.phone && !validator.isMobilePhone(profileData.phone, 'any', { strictMode: false })) errors.push('Phone number is not valid');
    if (profileData.dateOfBirth) {
      const dob = new Date(profileData.dateOfBirth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 13 || age > 120) errors.push('You must be at least 13 years old and not older than 120 years');
    }
    return { isValid: errors.length === 0, errors };
  },
  validateEmail: (email: string): boolean => validator.isEmail(email),
  validatePhone: (phone: string): boolean => validator.isMobilePhone(phone, 'any', { strictMode: false }),
  validateTimezone: (timezone: string): boolean => {
    try { Intl.DateTimeFormat(undefined, { timeZone: timezone }); return true; }
    catch { return false; }
  },
  validateSocialLinks: (socialLinks: Record<string, string>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'github', 'youtube', 'website'];
    if (socialLinks) {
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (!validPlatforms.includes(platform.toLowerCase())) errors.push('Invalid social platform: ' + platform);
        if (!validator.isURL(url)) errors.push('Invalid URL for ' + platform + ': ' + url);
      });
    }
    return { isValid: errors.length === 0, errors };
  }
};

// ═══════════════════════════════════════════════
// USER EVENTS (EventEmitter)
// ═══════════════════════════════════════════════

export class UserEvents extends EventEmitter {
  private static instance: UserEvents;

  static getInstance(): UserEvents {
    if (!UserEvents.instance) UserEvents.instance = new UserEvents();
    return UserEvents.instance;
  }

  emitUserCreated(user: IUserDoc) { this.emit('user:created', user); }
  emitUserLogin(user: IUserDoc, loginDetails: Partial<ILoginHistory>) { this.emit('user:login', user, loginDetails); }
  emitUserLogout(user: IUserDoc) { this.emit('user:logout', user); }
  emitProfileUpdated(user: IUserDoc, changes: string[]) { this.emit('user:profile_updated', user, changes); }
  emitPasswordChanged(user: IUserDoc) { this.emit('user:password_changed', user); }
  emitEmailVerified(user: IUserDoc) { this.emit('user:email_verified', user); }
  emitAccountLocked(user: IUserDoc) { this.emit('user:account_locked', user); }
  emitSuspiciousActivity(user: IUserDoc, activity: any) { this.emit('user:suspicious_activity', user, activity); }
  emitFriendRequestSent(fromUser: IUserDoc, toUser: IUserDoc) { this.emit('user:friend_request_sent', fromUser, toUser); }
  emitFriendRequestAccepted(user: IUserDoc, friend: IUserDoc) { this.emit('user:friend_request_accepted', user, friend); }
  emitUserBlocked(blocker: IUserDoc, blocked: IUserDoc) { this.emit('user:blocked', blocker, blocked); }
  emitUserUnblocked(unblocker: IUserDoc, unblocked: IUserDoc) { this.emit('user:unblocked', unblocker, unblocked); }
}

// ═══════════════════════════════════════════════
// SUB-SCHEMAS
// ═══════════════════════════════════════════════

const loginHistorySchema = new Schema<ILoginHistory>({
  ipAddress: { type: String, required: true, validate: { validator: (value: string) => validator.isIP(value), message: 'Invalid IP address' } },
  userAgent: { type: String, maxlength: 500 },
  timestamp: { type: Date, default: Date.now, index: true },
  deviceInfo: String,
  location: String,
  loginMethod: { type: String, enum: ['password', '2fa', 'social', 'magic-link'], default: 'password' },
  success: { type: Boolean, default: true },
  failureReason: String
}, { _id: false });

const twoFactorAuthSchema = new Schema<ITwoFactorAuth>({
  enabled: { type: Boolean, default: false },
  secret: { type: String, select: false },
  backupCodes: [{ type: String, select: false }],
  enabledAt: Date,
  lastUsed: Date,
  method: { type: String, enum: ['totp', 'sms', 'email'], default: 'totp' },
  recoveryCodesUsed: { type: Number, default: 0 }
}, { _id: false });

const addressSchema = new Schema<IAddress>({
  type: { type: String, enum: Object.values(AddressType), default: AddressType.HOME },
  street: { type: String, required: true, trim: true, maxlength: 200 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  zipCode: { type: String, required: true, trim: true, maxlength: 20 },
  isDefault: { type: Boolean, default: false },
  coordinates: { latitude: Number, longitude: Number },
  verified: { type: Boolean, default: false }
}, { _id: false });

const avatarSchema = new Schema<IAvatar>({
  url: { type: String, required: true, validate: { validator: (value: string) => validator.isURL(value), message: 'Invalid avatar URL' } },
  publicId: { type: String, required: true },
  thumbnailUrl: { type: String, validate: { validator: (value: string) => validator.isURL(value), message: 'Invalid thumbnail URL' } },
  originalName: String,
  size: Number,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const preferencesSchema = new Schema<IPreferences>({
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    security: { type: Boolean, default: true },
    social: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: { type: String, enum: Object.values(ProfileVisibility), default: ProfileVisibility.PUBLIC },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showOnlineStatus: { type: Boolean, default: true },
    showLastSeen: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    searchable: { type: Boolean, default: true }
  },
  security: {
    requireTwoFactorForPasswordChange: { type: Boolean, default: false },
    requireTwoFactorForEmailChange: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 60 },
    allowMultipleSessions: { type: Boolean, default: true },
    ipWhitelist: [String],
    suspiciousActivityAlerts: { type: Boolean, default: true }
  },
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  theme: { type: String, enum: Object.values(Theme), default: Theme.AUTO },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: { type: String, enum: ['12', '24'], default: '24' }
}, { _id: false });

// ═══════════════════════════════════════════════
// IUSERDOC + USERMODEL TYPES
// ═══════════════════════════════════════════════

export interface IUserDoc extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastSeen(): Promise<IUserDoc>;
  updateOnlineStatus(isOnline: boolean): Promise<IUserDoc>;
  isAccountLocked(): boolean;
  incrementLoginAttempts(): Promise<IUserDoc>;
  resetLoginAttempts(): Promise<IUserDoc>;
  addLoginHistory(details: Partial<ILoginHistory>): Promise<IUserDoc>;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
  createPhoneVerificationToken(): string;
  getAge(): number | null;
  getFullName(): string;
  getDisplayName(): string;
  isProfileComplete(): boolean;
  updateProfile(updates: Partial<IUser>): Promise<IUserDoc>;
  isFollowing(userId: Types.ObjectId): boolean;
  isBlocked(userId: Types.ObjectId): boolean;
  isFriend(userId: Types.ObjectId): boolean;
  canViewProfile(viewerId: Types.ObjectId): boolean;
  sendFriendRequest(targetUserId: Types.ObjectId): Promise<boolean>;
  acceptFriendRequest(fromUserId: Types.ObjectId): Promise<boolean>;
  blockUser(userIdToBlock: Types.ObjectId): Promise<boolean>;
  unblockUser(userIdToUnblock: Types.ObjectId): Promise<boolean>;
  createSession(deviceInfo: string, ipAddress: string): Promise<string>;
  invalidateSession(sessionId: string): Promise<boolean>;
  invalidateAllSessions(): Promise<boolean>;
  addAuditLog(action: string, details: Record<string, any>, ipAddress?: string): Promise<void>;
  toSafeJSON(): Record<string, any>;
  hasPermission(permission: string): boolean;
  hasAllPermissions(permissions: string[]): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  getAllPermissions(): Permission[];
  getRoleLevel(): number;
  isAdminUser(): boolean;
  hasActiveSubscription(): boolean;
  hasFeature(feature: string): boolean;
  readonly fullName: string;
  readonly displayNameOrUsername: string;
  readonly isAccountActive: boolean;
  readonly accountAgeInDays: number;
  readonly lastActive: Date;
  readonly profileCompletion: number;
  readonly totalConnections: number;
  readonly isAdmin: boolean;
}

export interface UserModel extends Model<IUserDoc> {
  searchUsers(query: string, options?: { limit?: number; skip?: number; language?: string; fields?: string[]; includeInactive?: boolean }): Promise<IUserDoc[]>;
  findByEmail(email: string, includeDeleted?: boolean): Promise<IUserDoc | null>;
  findByUsername(username: string, includeDeleted?: boolean): Promise<IUserDoc | null>;
  findByPhone(phone: string, includeDeleted?: boolean): Promise<IUserDoc | null>;
  getUserStats(dateRange?: { start: Date; end: Date }): Promise<any[]>;
  getActiveUsers(options?: { limit?: number; skip?: number; sortBy?: string }): Promise<IUserDoc[]>;
  getTopUsers(metric: 'followers' | 'connections' | 'activity', limit?: number): Promise<IUserDoc[]>;
  bulkUpdateStatus(userIds: Types.ObjectId[], status: UserStatus): Promise<any>;
  cleanupInactiveUsers(daysInactive: number): Promise<number>;
  findSuspiciousLogins(timeWindow?: number): Promise<any[]>;
  findUsersWithExpiredTokens(): Promise<IUserDoc[]>;
  createAdminUser(userData: Partial<IUser>, createdBy: Types.ObjectId): Promise<IUserDoc>;
  getPasswordResetStats(): Promise<any[]>;
  getUserGrowthMetrics(days?: number): Promise<any[]>;
  findDormantUsers(daysInactive?: number): Promise<IUserDoc[]>;
  getEngagementMetrics(): Promise<any[]>;
}

// ═══════════════════════════════════════════════
// USER SCHEMA FIELDS
// ═══════════════════════════════════════════════

const identityFields = {
  username: {
    type: String, required: [true, 'Username is required'], unique: true,
    minlength: [USER_CONSTANTS.USERNAME.MIN_LENGTH, 'Username must be at least ' + USER_CONSTANTS.USERNAME.MIN_LENGTH + ' characters long'],
    maxlength: [USER_CONSTANTS.USERNAME.MAX_LENGTH, 'Username cannot exceed ' + USER_CONSTANTS.USERNAME.MAX_LENGTH + ' characters'],
    trim: true, lowercase: true, match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, dots, hyphens, and underscores'],
    index: true,
    validate: { validator: function (this: any, username: string) { if (this && this.status === 'deleted') return true; return !USER_CONSTANTS.USERNAME.RESERVED.includes(username.toLowerCase() as any); }, message: 'This username is reserved' }
  },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, validate: { validator: function (this: any, value: string) { if (this && this.status === 'deleted') return true; return validator.isEmail(value); }, message: 'Please provide a valid email address' }, index: true },
  password: { type: String, minlength: [USER_CONSTANTS.PASSWORD.MIN_LENGTH, 'Password must be at least ' + USER_CONSTANTS.PASSWORD.MIN_LENGTH + ' characters long'], select: false, validate: { validator: isStrongPassword, message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' } },
  firstName: { type: String, trim: true, maxlength: [USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH, 'First name cannot exceed ' + USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH + ' characters'], match: [/^[a-zA-Z\s'\-]+$/, 'First name can only contain letters, spaces, apostrophes, and hyphens'] },
  lastName: { type: String, trim: true, maxlength: [USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH, 'Last name cannot exceed ' + USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH + ' characters'], match: [/^[a-zA-Z\s'\-]+$/, 'Last name can only contain letters, spaces, apostrophes, and hyphens'] },
  displayName: { type: String, trim: true, maxlength: [100, 'Display name cannot exceed 100 characters'] },
  avatar: avatarSchema,
  phone: { type: String, validate: { validator: (phone: string) => validator.isMobilePhone(phone, 'any', { strictMode: false }), message: 'Please provide a valid phone number' } },
  phoneVerified: { type: Boolean, default: false },
  dateOfBirth: { type: Date, validate: { validator: function (dob: Date) { const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)); return age >= 13 && age <= 120; }, message: 'You must be at least 13 years old and not older than 120 years' } },
  gender: { type: String, enum: Object.values(Gender) },
  bio: { type: String, maxlength: [USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH, 'Bio cannot exceed ' + USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH + ' characters'], trim: true },
  website: { type: String, validate: { validator: (value: string) => validator.isURL(value), message: 'Please provide a valid website URL' } },
  socialLinks: { type: Map, of: String }
};

const connectionFields = {
  lastSeen: { type: Date, default: Date.now, index: true },
  lastLoginDevice: String,
  userLanguage: { type: String, required: true, enum: ['en', 'bn', 'hi', 'ur', 'ne', 'si', 'dz', 'dv', 'ps', 'fa', 'ar', 'he', 'tr', 'th', 'vi', 'km', 'lo', 'my', 'ms', 'id', 'tl', 'zh', 'ja', 'ko', 'mn', 'de', 'fr', 'it', 'es', 'ca', 'eu', 'gl', 'pt', 'nl', 'sv', 'da', 'no', 'fi', 'is', 'et', 'lv', 'lt', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'sr', 'hr', 'bs', 'mk', 'sq', 'sl', 'mt', 'uk', 'be', 'ru', 'kk', 'uz', 'tg', 'tk', 'ky', 'ka', 'hy', 'az', 'so', 'am', 'ti', 'sw', 'rw', 'rn', 'mg', 'zu', 'xh', 'st', 'ss', 'tn', 'ny', 'sn', 'af', 'yo', 'ig', 'ha', 'ak', 'wo', 'bm', 'dy', 'ht', 'fj', 'sm', 'to', 'ch', 'tpi', 'bi', 'mi', 'kl', 'fo', 'ga', 'gd', 'cy', 'lb', 'fy', 'gv', 'kw', 'co', 'sc', 'rm', 'wa', 'oc', 'an', 'ast', 'ext', 'lad', 'mwl', 'pap', 'tzl', 'vo'], default: 'en' },
  timezone: { type: String, required: true, default: 'UTC', validate: { validator: validateTimezone, message: 'Invalid timezone' } },
  registrationIP: { type: String, validate: { validator: (value: string) => validator.isIP(value), message: 'Invalid registration IP address' } },
  detectedCountry: { type: String, maxlength: 2, uppercase: true },
  currentIP: { type: String, validate: { validator: (value: string) => validator.isIP(value), message: 'Invalid current IP address' } }
};

const statusFields = {
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE, index: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER, index: true },
  permissions: { type: [String], enum: Object.values(Permission), default: [] },
  isActive: { type: Boolean, default: true, index: true },
  isOnline: { type: Boolean, default: false, index: true },
  isVerified: { type: Boolean, default: false, index: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false, validate: { validator: function (v: string) { return v === undefined || (v.length === 6 && /^[A-Z0-9]{6}$/.test(v)); }, message: 'Verification token must be 6 alphanumeric characters' } },
  emailVerificationExpires: { type: Date, select: false },
  isBanned: { type: Boolean, default: false, index: true },
  isSuspended: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false, index: true }
};

const socialFields = {
  googleId: { type: String, unique: true, sparse: true, index: true },
  githubId: { type: String, unique: true, sparse: true, index: true },
  facebookId: { type: String, unique: true, sparse: true, index: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  friendRequests: { sent: [{ type: Schema.Types.ObjectId, ref: 'User' }], received: [{ type: Schema.Types.ObjectId, ref: 'User' }] }
};

const securityFields = {
  loginHistory: [loginHistorySchema],
  twoFactorAuth: { type: twoFactorAuthSchema, default: () => ({ enabled: false, method: 'totp', recoveryCodesUsed: 0 }) },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: Date,
  phoneVerificationToken: { type: String, select: false },
  phoneVerificationExpires: Date,
  passwordChangedAt: Date,
  loginAttempts: { type: Number, default: 0, select: false, min: 0, max: 10 },
  lockoutUntil: Date
};

const settingsFields = {
  preferences: { type: Schema.Types.Mixed, default: { theme: 'auto', language: 'en', timezone: 'UTC', notifications: { email: true, push: true, twoFactor: true, marketing: false, security: true, orderUpdates: true, priceAlerts: false, newsletter: false } } },
  addresses: { type: [addressSchema], validate: { validator: function (addresses: any[]) { return addresses.length <= USER_CONSTANTS.LIMITS.MAX_ADDRESSES; }, message: 'Cannot have more than ' + USER_CONSTANTS.LIMITS.MAX_ADDRESSES + ' addresses' } },
  loginCount: { type: Number, default: 0 },
  lastLoginAt: Date,
  accountCreatedAt: { type: Date, default: Date.now },
  metadata: { userAgent: String, referrer: String, campaign: String, source: String, medium: String, utmParameters: { type: Map, of: String }, deviceFingerprint: String, initialCountry: String, signupFlow: String },
  subscription: { plan: String, status: String, expiresAt: Date, features: [String] },
  apiKeys: [{ key: { type: String, select: false }, name: String, permissions: [String], lastUsed: Date, expiresAt: Date, isActive: { type: Boolean, default: true } }],
  sessions: [{ sessionId: String, deviceInfo: String, ipAddress: String, createdAt: { type: Date, default: Date.now }, lastActivity: { type: Date, default: Date.now }, isActive: { type: Boolean, default: true } }],
  auditLog: [{ action: String, details: Schema.Types.Mixed, ipAddress: String, userAgent: String, timestamp: { type: Date, default: Date.now } }]
};

// ═══════════════════════════════════════════════
// SCHEMA CREATION
// ═══════════════════════════════════════════════

export const UserSchema = new Schema<IUserDoc>({}, {
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret._id; delete ret.__v; delete ret.password;
      delete ret.resetPasswordToken; delete ret.resetPasswordExpires;
      delete ret.emailVerificationToken; delete ret.emailVerificationExpires;
      delete ret.phoneVerificationToken; delete ret.phoneVerificationExpires;
      delete ret.loginAttempts; delete ret.lockoutUntil;
      if (ret.twoFactorAuth) { delete ret.twoFactorAuth.secret; delete ret.twoFactorAuth.backupCodes; }
      if (ret.apiKeys) ret.apiKeys.forEach((key: any) => { delete key.key; });
      ret.id = doc._id.toString();
      return ret;
    }
  },
  toObject: { virtuals: true }
});

UserSchema.add(identityFields);
UserSchema.add(connectionFields);
UserSchema.add(statusFields);
UserSchema.add(socialFields);
UserSchema.add(securityFields);
UserSchema.add(settingsFields);

// Indexes
UserSchema.index({ username: 'text', email: 'text', firstName: 'text', lastName: 'text', displayName: 'text' });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ status: 1, isActive: 1, isBanned: 1 });
UserSchema.index({ isOnline: 1, lastSeen: -1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: 1, status: 1 });
UserSchema.index({ 'preferences.language': 1 });
UserSchema.index({ 'preferences.timezone': 1 });
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });
UserSchema.index({ friends: 1 });
UserSchema.index({ detectedCountry: 1, registrationIP: 1 });
UserSchema.index({ 'loginHistory.timestamp': -1 });
UserSchema.index({ 'subscription.status': 1, 'subscription.expiresAt': 1 });
UserSchema.index({ 'sessions.isActive': 1, 'sessions.lastActivity': -1 });
UserSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ emailVerificationExpires: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ phoneVerificationExpires: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ lockoutUntil: 1 }, { expireAfterSeconds: 0 });

// ═══════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════

UserSchema.virtual('fullName').get(function (this: IUserDoc) {
  const firstName = this.firstName || '';
  const lastName = this.lastName || '';
  return (firstName + ' ' + lastName).trim() || this.username;
});

UserSchema.virtual('displayNameOrUsername').get(function (this: IUserDoc) {
  return this.displayName || this.fullName || this.username;
});

UserSchema.virtual('isAccountActive').get(function (this: IUserDoc) {
  return this.status === UserStatus.ACTIVE && this.isActive && !this.isBanned && !this.isSuspended && !this.isDeleted;
});

UserSchema.virtual('accountAgeInDays').get(function (this: IUserDoc) {
  const createdAt = this.accountCreatedAt || this.createdAt || new Date();
  return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

UserSchema.virtual('lastActive').get(function (this: IUserDoc) {
  return this.lastSeen || this.updatedAt || new Date();
});

UserSchema.virtual('profileCompletion').get(function (this: IUserDoc) {
  let completion = 0;
  if (this.username) completion += 12.5;
  if (this.email && this.emailVerified) completion += 12.5;
  if (this.firstName) completion += 12.5;
  if (this.lastName) completion += 12.5;
  if (this.avatar && this.avatar.url) completion += 12.5;
  if (this.bio) completion += 12.5;
  if (this.dateOfBirth) completion += 12.5;
  if (this.phone && this.phoneVerified) completion += 12.5;
  return Math.min(completion, 100);
});

UserSchema.virtual('totalConnections').get(function (this: IUserDoc) {
  const followersCount = this.followers ? this.followers.length : 0;
  const followingCount = this.following ? this.following.length : 0;
  const friendsCount = this.friends ? this.friends.length : 0;
  return followersCount + followingCount + friendsCount;
});

UserSchema.virtual('isAdmin').get(function (this: IUserDoc) {
  return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
});

// ═══════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════

const applyAuthMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };
  schema.methods.updateLastSeen = async function (): Promise<IUserDoc> {
    this.lastSeen = new Date();
    this.isOnline = true;
    return this.save();
  };
};

const applySecurityMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.isAccountLocked = function (): boolean {
    return !!(this.lockoutUntil && this.lockoutUntil > new Date());
  };
  schema.methods.incrementLoginAttempts = async function (): Promise<IUserDoc> {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    if (this.loginAttempts >= USER_CONSTANTS.LOCKOUT.MAX_ATTEMPTS) {
      const delayMinutes = USER_CONSTANTS.LOCKOUT.PROGRESSIVE_DELAYS[
        Math.min(this.loginAttempts - USER_CONSTANTS.LOCKOUT.MAX_ATTEMPTS, USER_CONSTANTS.LOCKOUT.PROGRESSIVE_DELAYS.length - 1)
      ];
      this.lockoutUntil = new Date(Date.now() + delayMinutes * 60 * 1000);
      await this.addAuditLog('ACCOUNT_LOCKED', { attempts: this.loginAttempts, lockoutDuration: delayMinutes });
    }
    return this.save();
  };
  schema.methods.resetLoginAttempts = async function (): Promise<IUserDoc> {
    this.loginAttempts = 0;
    this.lockoutUntil = undefined;
    return this.save();
  };
  schema.methods.addLoginHistory = async function (details: Partial<ILoginHistory>): Promise<IUserDoc> {
    if (!this.loginHistory) this.loginHistory = [];
    const loginEntry: ILoginHistory = {
      ipAddress: details.ipAddress || '0.0.0.0',
      userAgent: sanitizeUserAgent(details.userAgent || ''),
      timestamp: new Date(),
      deviceInfo: details.deviceInfo || getDeviceInfo(details.userAgent || ''),
      location: details.location,
      loginMethod: details.loginMethod || 'password',
      success: details.success !== false,
      failureReason: details.failureReason
    };
    this.loginHistory.unshift(loginEntry);
    if (this.loginHistory.length > USER_CONSTANTS.LIMITS.MAX_LOGIN_HISTORY) {
      this.loginHistory = this.loginHistory.slice(0, USER_CONSTANTS.LIMITS.MAX_LOGIN_HISTORY);
    }
    if (loginEntry.success) {
      this.loginCount = (this.loginCount || 0) + 1;
      this.lastLoginAt = new Date();
      this.currentIP = loginEntry.ipAddress;
    }
    return this.save();
  };
  schema.methods.createPasswordResetToken = function (): string {
    const resetToken = generateSecureToken();
    this.resetPasswordToken = hashToken(resetToken);
    this.resetPasswordExpires = new Date(Date.now() + USER_CONSTANTS.PASSWORD.RESET_TOKEN_EXPIRY);
    return resetToken;
  };
  schema.methods.createEmailVerificationToken = function (): string {
    const verificationToken = generateSecureToken();
    this.emailVerificationToken = hashToken(verificationToken);
    this.emailVerificationExpires = new Date(Date.now() + USER_CONSTANTS.VERIFICATION.EMAIL_TOKEN_EXPIRY);
    return verificationToken;
  };
  schema.methods.createPhoneVerificationToken = function (): string {
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    this.phoneVerificationToken = hashToken(verificationToken);
    this.phoneVerificationExpires = new Date(Date.now() + USER_CONSTANTS.VERIFICATION.PHONE_TOKEN_EXPIRY);
    return verificationToken;
  };
};

const applyProfileMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.getAge = function (): number | null {
    if (!this.dateOfBirth) return null;
    return calculateAge(this.dateOfBirth);
  };
  schema.methods.getFullName = function (): string { return this.fullName; };
  schema.methods.getDisplayName = function (): string { return this.displayNameOrUsername; };
  schema.methods.isProfileComplete = function (): boolean { return this.profileCompletion >= 60; };
  schema.methods.updateProfile = async function (updates: any): Promise<IUserDoc> {
    const allowedUpdates = ['firstName', 'lastName', 'displayName', 'bio', 'website', 'dateOfBirth', 'gender', 'phone', 'socialLinks', 'preferences'];
    Object.keys(updates).forEach(key => { if (allowedUpdates.includes(key)) (this as any)[key] = updates[key]; });
    await this.addAuditLog('PROFILE_UPDATED', { updatedFields: Object.keys(updates) });
    return this.save();
  };
};

const applySocialMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.isFollowing = function (userId: Types.ObjectId): boolean {
    return this.following ? this.following.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };
  schema.methods.isBlocked = function (userId: Types.ObjectId): boolean {
    return this.blockedUsers ? this.blockedUsers.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };
  schema.methods.isFriend = function (userId: Types.ObjectId): boolean {
    return this.friends ? this.friends.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };
  schema.methods.canViewProfile = function (viewerId: Types.ObjectId): boolean {
    if (this.isBlocked(viewerId)) return false;
    const privacy = this.preferences?.privacy;
    if (!privacy) return true;
    switch (privacy.profileVisibility) {
      case ProfileVisibility.PUBLIC: return true;
      case ProfileVisibility.FRIENDS: return this.isFriend(viewerId);
      case ProfileVisibility.PRIVATE: return this._id.equals(viewerId);
      default: return true;
    }
  };
  schema.methods.sendFriendRequest = async function (targetUserId: Types.ObjectId): Promise<boolean> {
    if (this.isBlocked(targetUserId) || this.isFriend(targetUserId)) return false;
    const targetUser = await (this.constructor as any).findById(targetUserId);
    if (!targetUser || !targetUser.preferences?.privacy?.allowFriendRequests) return false;
    if (!this.friendRequests) this.friendRequests = { sent: [], received: [] };
    if (!this.friendRequests.sent.some((id: Types.ObjectId) => id.equals(targetUserId))) this.friendRequests.sent.push(targetUserId);
    if (!targetUser.friendRequests) targetUser.friendRequests = { sent: [], received: [] };
    if (!targetUser.friendRequests.received.some((id: Types.ObjectId) => id.equals(this._id))) targetUser.friendRequests.received.push(this._id);
    await Promise.all([this.save(), targetUser.save()]);
    await this.addAuditLog('FRIEND_REQUEST_SENT', { targetUserId });
    return true;
  };
  schema.methods.acceptFriendRequest = async function (fromUserId: Types.ObjectId): Promise<boolean> {
    if (!this.friendRequests?.received.some((id: Types.ObjectId) => id.equals(fromUserId))) return false;
    const fromUser = await (this.constructor as any).findById(fromUserId);
    if (!fromUser) return false;
    if (!this.friends.some((id: Types.ObjectId) => id.equals(fromUserId))) this.friends.push(fromUserId);
    if (!fromUser.friends.some((id: Types.ObjectId) => id.equals(this._id))) fromUser.friends.push(this._id);
    this.friendRequests.received = this.friendRequests.received.filter((id: Types.ObjectId) => !id.equals(fromUserId));
    fromUser.friendRequests.sent = fromUser.friendRequests.sent.filter((id: Types.ObjectId) => !id.equals(this._id));
    await Promise.all([this.save(), fromUser.save()]);
    await this.addAuditLog('FRIEND_REQUEST_ACCEPTED', { fromUserId });
    return true;
  };
  schema.methods.blockUser = async function (userIdToBlock: Types.ObjectId): Promise<boolean> {
    if (this.isBlocked(userIdToBlock)) return false;
    this.blockedUsers.push(userIdToBlock);
    this.friends = this.friends.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));
    this.following = this.following.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));
    this.followers = this.followers.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));
    await this.addAuditLog('USER_BLOCKED', { blockedUserId: userIdToBlock });
    return this.save().then(() => true);
  };
  schema.methods.unblockUser = async function (userIdToUnblock: Types.ObjectId): Promise<boolean> {
    if (!this.isBlocked(userIdToUnblock)) return false;
    this.blockedUsers = this.blockedUsers.filter((id: Types.ObjectId) => !id.equals(userIdToUnblock));
    await this.addAuditLog('USER_UNBLOCKED', { unblockedUserId: userIdToUnblock });
    return this.save().then(() => true);
  };
};

const applySessionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.createSession = async function (deviceInfo: string, ipAddress: string): Promise<string> {
    const sessionId = generateSecureToken();
    if (!this.sessions) this.sessions = [];
    this.sessions.push({ sessionId, deviceInfo: sanitizeUserAgent(deviceInfo), ipAddress, createdAt: new Date(), lastActivity: new Date(), isActive: true });
    await this.save();
    return sessionId;
  };
  schema.methods.invalidateSession = async function (sessionId: string): Promise<boolean> {
    if (!this.sessions) return false;
    const session = this.sessions.find((s: any) => s.sessionId === sessionId);
    if (session) { session.isActive = false; await this.save(); return true; }
    return false;
  };
  schema.methods.invalidateAllSessions = async function (): Promise<boolean> {
    if (this.sessions) { this.sessions.forEach((session: any) => { session.isActive = false; }); await this.save(); }
    return true;
  };
};

const applyAuditMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.addAuditLog = async function (action: string, details: Record<string, any>, ipAddress?: string): Promise<void> {
    if (!this.auditLog) this.auditLog = [];
    this.auditLog.unshift({ action, details, ipAddress, userAgent: details.userAgent, timestamp: new Date() });
    if (this.auditLog.length > 100) this.auditLog = this.auditLog.slice(0, 100);
  };
  schema.methods.toSafeJSON = function (): Record<string, any> {
    const obj = this.toJSON();
    delete obj.auditLog; delete obj.sessions;
    if (obj.metadata) delete obj.metadata.deviceFingerprint;
    return obj;
  };
};

const applyPermissionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.hasPermission = function (permission: string): boolean {
    if (this.role === UserRole.SUPER_ADMIN) return true;
    if (this.permissions && this.permissions.includes(permission as Permission)) return true;
    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: [Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT, Permission.USERS_DELETE, Permission.ROLES_VIEW, Permission.ROLES_EDIT, Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT, Permission.CONTENT_DELETE, Permission.SYSTEM_VIEW, Permission.SYSTEM_SETTINGS, Permission.ANALYTICS_VIEW, Permission.TICKETS_VIEW, Permission.TICKETS_EDIT, Permission.BILLING_VIEW, Permission.BILLING_EDIT],
      [UserRole.MODERATOR]: [Permission.USERS_VIEW, Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT, Permission.TICKETS_VIEW, Permission.TICKETS_EDIT],
      [UserRole.PREMIUM]: [Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT],
      [UserRole.USER]: [Permission.CONTENT_VIEW]
    };
    const permissions = rolePermissions[this.role as UserRole] || [];
    return permissions.includes(permission);
  };
  schema.methods.hasAllPermissions = function (permissions: string[]): boolean { return permissions.every(p => this.hasPermission(p)); };
  schema.methods.hasAnyPermission = function (permissions: string[]): boolean { return permissions.some(p => this.hasPermission(p)); };
  schema.methods.getAllPermissions = function (): Permission[] {
    if (this.role === UserRole.SUPER_ADMIN) return Object.values(Permission) as Permission[];
    const explicitPermissions = (this.permissions || []) as Permission[];
    const rolePermissionsMap: Record<string, Permission[]> = {
      [UserRole.ADMIN]: [Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT, Permission.USERS_DELETE, Permission.ROLES_VIEW, Permission.ROLES_EDIT, Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT, Permission.CONTENT_DELETE, Permission.SYSTEM_VIEW, Permission.SYSTEM_SETTINGS, Permission.ANALYTICS_VIEW, Permission.TICKETS_VIEW, Permission.TICKETS_EDIT, Permission.BILLING_VIEW, Permission.BILLING_EDIT],
      [UserRole.MODERATOR]: [Permission.USERS_VIEW, Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT, Permission.TICKETS_VIEW, Permission.TICKETS_EDIT],
      [UserRole.PREMIUM]: [Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT],
      [UserRole.USER]: [Permission.CONTENT_VIEW]
    };
    const defaultPermissions = rolePermissionsMap[this.role as UserRole] || [];
    return Array.from(new Set([...explicitPermissions, ...defaultPermissions]));
  };
  schema.methods.getRoleLevel = function (): number {
    const roleLevels: Record<string, number> = { [UserRole.USER]: 1, [UserRole.PREMIUM]: 2, [UserRole.MODERATOR]: 3, [UserRole.ADMIN]: 4, [UserRole.SUPER_ADMIN]: 5 };
    return roleLevels[this.role as UserRole] || 0;
  };
  schema.methods.isAdminUser = function (): boolean { return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN; };
};

const applySubscriptionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.hasActiveSubscription = function (): boolean {
    return !!(this.subscription && this.subscription.status === 'active' && (!this.subscription.expiresAt || this.subscription.expiresAt > new Date()));
  };
  schema.methods.hasFeature = function (feature: string): boolean {
    if (this.role === UserRole.PREMIUM || this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN) return true;
    return !!(this.subscription && this.subscription.features && this.subscription.features.includes(feature));
  };
};

const applyUserMethods = (schema: Schema<IUserDoc>) => {
  applyAuthMethods(schema);
  applySecurityMethods(schema);
  applyProfileMethods(schema);
  applySocialMethods(schema);
  applySessionMethods(schema);
  applyAuditMethods(schema);
  applyPermissionMethods(schema);
  applySubscriptionMethods(schema);
};

// ═══════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════

const applyUserSearchStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.searchUsers = function (query: string, options: { limit?: number; skip?: number; language?: string; fields?: string[]; includeInactive?: boolean } = {}) {
    const { limit = 20, skip = 0, fields = ['username', 'email', 'firstName', 'lastName', 'displayName'], includeInactive = false } = options;
    const searchConditions = fields.map(field => ({ [field]: { $regex: query, $options: 'i' } }));
    const baseFilter: any = { $or: searchConditions, isBanned: false, isDeleted: { $ne: true } };
    if (!includeInactive) baseFilter.status = UserStatus.ACTIVE;
    return this.find(baseFilter).limit(limit).skip(skip).select('username email firstName lastName displayName avatar isOnline lastSeen role isVerified').sort({ isOnline: -1, lastSeen: -1, isVerified: -1 });
  };
  schema.statics.findByEmail = function (email: string, includeDeleted: boolean = false) {
    const filter: any = { email: email.toLowerCase().trim() };
    if (!includeDeleted) filter.isDeleted = { $ne: true };
    return this.findOne(filter);
  };
  schema.statics.findByUsername = function (username: string, includeDeleted: boolean = false) {
    const filter: any = { username: username.toLowerCase().trim() };
    if (!includeDeleted) filter.isDeleted = { $ne: true };
    return this.findOne(filter);
  };
  schema.statics.findByPhone = function (phone: string, includeDeleted: boolean = false) {
    const filter: any = { phone };
    if (!includeDeleted) filter.isDeleted = { $ne: true };
    return this.findOne(filter);
  };
};

const applyUserStatsStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getUserStats = function (dateRange?: { start: Date; end: Date }) {
    const matchStage: any = { isDeleted: { $ne: true } };
    if (dateRange) matchStage.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    return this.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalUsers: { $sum: 1 }, activeUsers: { $sum: { $cond: [{ $eq: ['$status', UserStatus.ACTIVE] }, 1, 0] } }, onlineUsers: { $sum: { $cond: ['$isOnline', 1, 0] } }, verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } }, bannedUsers: { $sum: { $cond: ['$isBanned', 1, 0] } }, premiumUsers: { $sum: { $cond: [{ $eq: ['$role', UserRole.PREMIUM] }, 1, 0] } }, avgProfileCompletion: { $avg: '$profileCompletion' }, avgLoginCount: { $avg: '$loginCount' } } },
      { $addFields: { activePercentage: { $multiply: [{ $divide: ['$activeUsers', '$totalUsers'] }, 100] }, verificationRate: { $multiply: [{ $divide: ['$verifiedUsers', '$totalUsers'] }, 100] } } }
    ]);
  };
};

const applyUserMetricsStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getEngagementMetrics = function () {
    return this.aggregate([
      { $match: { status: UserStatus.ACTIVE, isDeleted: { $ne: true } } },
      { $addFields: { daysSinceLastLogin: { $divide: [{ $subtract: [new Date(), '$lastSeen'] }, 1000 * 60 * 60 * 24] }, followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } }, friendsCount: { $size: { $ifNull: ['$friends', []] } } } },
      { $group: { _id: null, totalActiveUsers: { $sum: 1 }, dailyActiveUsers: { $sum: { $cond: [{ $lte: ['$daysSinceLastLogin', 1] }, 1, 0] } }, weeklyActiveUsers: { $sum: { $cond: [{ $lte: ['$daysSinceLastLogin', 7] }, 1, 0] } }, monthlyActiveUsers: { $sum: { $cond: [{ $lte: ['$daysSinceLastLogin', 30] }, 1, 0] } }, avgFollowers: { $avg: '$followersCount' }, avgFollowing: { $avg: '$followingCount' }, avgFriends: { $avg: '$friendsCount' }, avgLoginCount: { $avg: '$loginCount' }, highlyEngagedUsers: { $sum: { $cond: [{ $and: [{ $gte: ['$followersCount', 10] }, { $gte: ['$loginCount', 20] }, { $lte: ['$daysSinceLastLogin', 7] }] }, 1, 0] } } } }
    ]);
  };
  schema.statics.getUserGrowthMetrics = function (days: number = 30) {
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
    return this.aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: { $ne: true } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, newUsers: { $sum: 1 }, verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } }, premiumUsers: { $sum: { $cond: [{ $eq: ['$role', UserRole.PREMIUM] }, 1, 0] } } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $project: { _id: 0, date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } }, newUsers: 1, verifiedUsers: 1, premiumUsers: 1, verificationRate: { $multiply: [{ $divide: ['$verifiedUsers', '$newUsers'] }, 100] } } }
    ]);
  };
};

const applyUserManagementStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.bulkUpdateStatus = function (userIds: Types.ObjectId[], status: UserStatus) {
    return this.updateMany({ _id: { $in: userIds }, isDeleted: { $ne: true } }, { $set: { status, updatedAt: new Date() } });
  };
  schema.statics.cleanupInactiveUsers = function (daysInactive: number = 365) {
    const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    return this.updateMany({ lastSeen: { $lt: cutoffDate }, status: { $in: [UserStatus.INACTIVE, UserStatus.PENDING] }, isDeleted: { $ne: true } }, { $set: { isDeleted: true, status: UserStatus.DELETED, updatedAt: new Date() } }).then((result: any) => result.modifiedCount);
  };
  schema.statics.findSuspiciousLogins = function (timeWindow: number = 24) {
    const timeThreshold = new Date(); timeThreshold.setHours(timeThreshold.getHours() - timeWindow);
    return this.aggregate([
      { $unwind: '$loginHistory' },
      { $match: { 'loginHistory.timestamp': { $gte: timeThreshold }, 'loginHistory.success': false } },
      { $group: { _id: '$_id', username: { $first: '$username' }, email: { $first: '$email' }, failedAttempts: { $sum: 1 }, distinctIPs: { $addToSet: '$loginHistory.ipAddress' }, lastFailure: { $max: '$loginHistory.timestamp' } } },
      { $match: { $or: [{ failedAttempts: { $gte: 5 } }, { distinctIPs: { $size: { $gte: 3 } } }] } },
      { $sort: { failedAttempts: -1, lastFailure: -1 } }
    ]);
  };
  schema.statics.findDormantUsers = function (daysInactive: number = 30) {
    const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    return this.find({ lastSeen: { $lt: cutoffDate }, status: UserStatus.ACTIVE, isDeleted: { $ne: true }, isBanned: false }).select('username email firstName lastName lastSeen loginCount accountCreatedAt').sort({ lastSeen: 1 }).limit(100);
  };
  schema.statics.findUsersWithExpiredTokens = function () {
    const now = new Date();
    return this.find({ $or: [{ resetPasswordExpires: { $lt: now } }, { emailVerificationExpires: { $lt: now } }, { phoneVerificationExpires: { $lt: now } }], isDeleted: { $ne: true } }).select('username email resetPasswordExpires emailVerificationExpires phoneVerificationExpires');
  };
};

const applyUserAdminStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.createAdminUser = async function (userData: Partial<IUser>, createdBy: Types.ObjectId): Promise<IUserDoc> {
    const creator = await this.findById(createdBy);
    if (!creator || creator.getRoleLevel() < 4) throw new Error('Insufficient permissions to create admin user');
    const adminData: Partial<IUser> = { ...userData, role: UserRole.ADMIN, isVerified: true, emailVerified: true, status: UserStatus.ACTIVE, twoFactorAuth: { enabled: true, method: 'totp', recoveryCodesUsed: 0 } };
    const adminUser = new this(adminData);
    await (adminUser as IUserDoc).addAuditLog('ADMIN_USER_CREATED', { createdBy: createdBy, role: adminData.role });
    return adminUser.save();
  };
  schema.statics.getPasswordResetStats = function () {
    return this.aggregate([
      { $match: { resetPasswordExpires: { $exists: true }, isDeleted: { $ne: true } } },
      { $group: { _id: null, totalRequests: { $sum: 1 }, expiredTokens: { $sum: { $cond: [{ $lt: ['$resetPasswordExpires', new Date()] }, 1, 0] } }, validTokens: { $sum: { $cond: [{ $gte: ['$resetPasswordExpires', new Date()] }, 1, 0] } } } }
    ]);
  };
};

const applyUserSocialStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getActiveUsers = function (options: { limit?: number; skip?: number; sortBy?: string } = {}) {
    const { limit = 50, skip = 0, sortBy = '-lastSeen' } = options;
    return this.find({ status: UserStatus.ACTIVE, isBanned: false, isDeleted: { $ne: true }, isOnline: true }).limit(limit).skip(skip).sort(sortBy).select('username email firstName lastName displayName avatar isOnline lastSeen role').populate('followers', 'username avatar').populate('following', 'username avatar');
  };
  schema.statics.getTopUsers = function (metric: 'followers' | 'connections' | 'activity', limit: number = 10) {
    let sortField: any;
    switch (metric) { case 'followers': sortField = { followersCount: -1 }; break; case 'connections': sortField = { totalConnections: -1 }; break; case 'activity': sortField = { loginCount: -1, lastLoginAt: -1 }; break; default: sortField = { createdAt: -1 }; }
    return this.aggregate([
      { $match: { status: UserStatus.ACTIVE, isBanned: false, isDeleted: { $ne: true } } },
      { $addFields: { followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } }, friendsCount: { $size: { $ifNull: ['$friends', []] } }, totalConnections: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }, { $size: { $ifNull: ['$friends', []] } }] } } },
      { $sort: sortField }, { $limit: limit },
      { $project: { username: 1, displayName: 1, avatar: 1, isVerified: 1, role: 1, followersCount: 1, totalConnections: 1, loginCount: 1, lastLoginAt: 1 } }
    ]);
  };
};

const applyUserStatics = (schema: Schema<IUserDoc>) => {
  applyUserSearchStatics(schema);
  applyUserStatsStatics(schema);
  applyUserMetricsStatics(schema);
  applyUserManagementStatics(schema);
  applyUserAdminStatics(schema);
  applyUserSocialStatics(schema);
};

// ═══════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════

const applyUserHooks = (schema: Schema<IUserDoc>) => {
  schema.pre<IUserDoc>('save', async function (next) {
    try {
      if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(USER_CONSTANTS.PASSWORD.SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordChangedAt = new Date();
      }
      if (this.isModified('username')) this.username = this.username.trim().toLowerCase();
      if (this.isModified('email') && this.email) this.email = this.email.toLowerCase().trim();
      if (this.isModified('addresses') && this.addresses && this.addresses.length > 0) {
        const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
        if (defaultAddresses.length > 1) {
          const firstDefaultIndex = this.addresses.findIndex(addr => addr.isDefault);
          this.addresses.forEach((addr, index) => { addr.isDefault = index === firstDefaultIndex; });
        }
      }
      if (this.loginHistory && this.loginHistory.length > USER_CONSTANTS.LIMITS.MAX_LOGIN_HISTORY) {
        this.loginHistory = this.loginHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, USER_CONSTANTS.LIMITS.MAX_LOGIN_HISTORY);
      }
      if (this.sessions) {
        const now = new Date();
        this.sessions = this.sessions.filter(session => {
          const sessionTimeout = this.preferences?.security?.sessionTimeout || 60;
          const expiryTime = new Date(session.lastActivity.getTime() + sessionTimeout * 60 * 1000);
          return session.isActive && expiryTime > now;
        });
      }
      next();
    } catch (error) { next(error as any); }
  });

  schema.pre(['find', 'findOne', 'findOneAndUpdate'], function (next) {
    const filter = this.getFilter();
    if (!filter.hasOwnProperty('isDeleted')) this.where({ isDeleted: { $ne: true } });
    next();
  });

  schema.post<IUserDoc>('save', async function (doc) {
    if (doc.isNew) {
      await doc.addAuditLog('USER_CREATED', { username: doc.username, email: doc.email, role: doc.role });
    }
  });
};

// ═══════════════════════════════════════════════
// APPLY ALL PLUGINS AND CREATE MODEL
// ═══════════════════════════════════════════════

applyUserHooks(UserSchema);
applyUserMethods(UserSchema);
applyUserStatics(UserSchema);

// Add event emitter plugin
UserSchema.plugin(function (schema: Schema<IUserDoc, UserModel>) {
  const userEvents = UserEvents.getInstance();
  schema.post('save', function (doc: IUserDoc) { if (doc.isNew) userEvents.emitUserCreated(doc); });
  schema.methods.emitLogin = function (loginDetails: any) { UserEvents.getInstance().emitUserLogin(this as IUserDoc, loginDetails); };
  schema.methods.emitLogout = function () { UserEvents.getInstance().emitUserLogout(this as IUserDoc); };
  schema.methods.emitProfileUpdated = function (changes: string[]) { UserEvents.getInstance().emitProfileUpdated(this as IUserDoc, changes); };
  schema.methods.emitPasswordChanged = function () { UserEvents.getInstance().emitPasswordChanged(this as IUserDoc); };
  schema.methods.emitEmailVerified = function () { UserEvents.getInstance().emitEmailVerified(this as IUserDoc); };
});

const User: UserModel = mongoose.model<IUserDoc, UserModel>('User', UserSchema);

export default User;
export { User };
