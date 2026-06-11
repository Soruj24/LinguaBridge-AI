import { Schema } from "mongoose";
import { ITwoFactorAuth } from "../interfaces/IUser";

export const twoFactorAuthSchema = new Schema<ITwoFactorAuth>({
  enabled: {
    type: Boolean,
    default: false
  },
  secret: {
    type: String,
    select: false
  },
  backupCodes: [{
    type: String,
    select: false,
  }],
  enabledAt: Date,
  lastUsed: Date,
  method: {
    type: String,
    enum: ['totp', 'sms', 'email'],
    default: 'totp'
  },
  recoveryCodesUsed: {
    type: Number,
    default: 0
  }
}, { _id: false });
