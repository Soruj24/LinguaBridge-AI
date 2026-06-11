import { Schema } from "mongoose";
import { IPreferences } from "../interfaces/IUser";
import { ProfileVisibility, Theme } from "../interfaces/IUser";

export const preferencesSchema = new Schema<IPreferences>({
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
    profileVisibility: {
      type: String,
      enum: Object.values(ProfileVisibility),
      default: ProfileVisibility.PUBLIC
    },
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
  theme: {
    type: String,
    enum: Object.values(Theme),
    default: Theme.AUTO
  },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: {
    type: String,
    enum: ['12', '24'],
    default: '24'
  }
}, { _id: false });
