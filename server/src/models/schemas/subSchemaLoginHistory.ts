import { Schema } from "mongoose";
import validator from "validator";
import { ILoginHistory } from "../interfaces/IUser";

export const loginHistorySchema = new Schema<ILoginHistory>({
  ipAddress: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isIP(value),
      message: 'Invalid IP address'
    }
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  deviceInfo: String,
  location: String,
  loginMethod: {
    type: String,
    enum: ['password', '2fa', 'social', 'magic-link'],
    default: 'password'
  },
  success: {
    type: Boolean,
    default: true
  },
  failureReason: String
}, { _id: false });
