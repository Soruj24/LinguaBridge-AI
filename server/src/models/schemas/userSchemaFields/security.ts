import { loginHistorySchema, twoFactorAuthSchema } from "../subSchemas";

export const securityFields = {
  loginHistory: [loginHistorySchema],

  twoFactorAuth: {
    type: twoFactorAuthSchema,
    default: () => ({
      enabled: false,
      method: 'totp',
      recoveryCodesUsed: 0
    })
  },

  resetPasswordToken: {
    type: String,
    select: false
  },

  resetPasswordExpires: Date,

  phoneVerificationToken: {
    type: String,
    select: false
  },

  phoneVerificationExpires: Date,

  passwordChangedAt: Date,

  loginAttempts: {
    type: Number,
    default: 0,
    select: false,
    min: 0,
    max: 10
  },

  lockoutUntil: Date
};
