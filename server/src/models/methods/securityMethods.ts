import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { ILoginHistory } from "../interfaces/IUser";
import { USER_CONSTANTS } from "../constants/UserConstants";
import { generateSecureToken, hashToken, sanitizeUserAgent, getDeviceInfo } from "../utils/UserUtils";

export const applySecurityMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.isAccountLocked = function (): boolean {
    return !!(this.lockoutUntil && this.lockoutUntil > new Date());
  };

  schema.methods.incrementLoginAttempts = async function (): Promise<IUserDoc> {
    this.loginAttempts = (this.loginAttempts || 0) + 1;

    if (this.loginAttempts >= USER_CONSTANTS.LOCKOUT.MAX_ATTEMPTS) {
      const delayMinutes = USER_CONSTANTS.LOCKOUT.PROGRESSIVE_DELAYS[
        Math.min(this.loginAttempts - USER_CONSTANTS.LOCKOUT.MAX_ATTEMPTS,
          USER_CONSTANTS.LOCKOUT.PROGRESSIVE_DELAYS.length - 1)
      ];
      this.lockoutUntil = new Date(Date.now() + delayMinutes * 60 * 1000);

      await this.addAuditLog('ACCOUNT_LOCKED', {
        attempts: this.loginAttempts,
        lockoutDuration: delayMinutes
      });
    }

    return this.save();
  };

  schema.methods.resetLoginAttempts = async function (): Promise<IUserDoc> {
    this.loginAttempts = 0;
    this.lockoutUntil = undefined;
    return this.save();
  };

  schema.methods.addLoginHistory = async function (details: Partial<ILoginHistory>): Promise<IUserDoc> {
    if (!this.loginHistory) {
      this.loginHistory = [];
    }

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
