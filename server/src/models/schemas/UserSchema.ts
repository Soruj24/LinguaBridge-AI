import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { identityFields } from "./userSchemaFields/identity";
import { connectionFields } from "./userSchemaFields/connection";
import { statusFields } from "./userSchemaFields/status";
import { socialFields } from "./userSchemaFields/social";
import { securityFields } from "./userSchemaFields/security";
import { settingsFields } from "./userSchemaFields/settings";

export const UserSchema = new Schema<IUserDoc>({}, {
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.phoneVerificationToken;
      delete ret.phoneVerificationExpires;
      delete ret.loginAttempts;
      delete ret.lockoutUntil;

      if (ret.twoFactorAuth) {
        delete ret.twoFactorAuth.secret;
        delete ret.twoFactorAuth.backupCodes;
      }

      if (ret.apiKeys) {
        ret.apiKeys.forEach((key: any) => {
          delete key.key;
        });
      }

      ret.id = doc._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

UserSchema.add(identityFields);
UserSchema.add(connectionFields);
UserSchema.add(statusFields);
UserSchema.add(socialFields);
UserSchema.add(securityFields);
UserSchema.add(settingsFields);

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
