import { Schema } from "mongoose";
import { addressSchema } from "../subSchemas";
import { USER_CONSTANTS } from "../../constants/UserConstants";

export const settingsFields = {
  preferences: {
    type: Schema.Types.Mixed,
    default: {
      theme: "auto",
      language: "en",
      timezone: "UTC",
      notifications: {
        email: true,
        push: true,
        twoFactor: true,
        marketing: false,
        security: true,
        orderUpdates: true,
        priceAlerts: false,
        newsletter: false,
      },
    },
  },

  addresses: {
    type: [addressSchema],
    validate: {
      validator: function (addresses: any[]) {
        return addresses.length <= USER_CONSTANTS.LIMITS.MAX_ADDRESSES;
      },
      message: `Cannot have more than ${USER_CONSTANTS.LIMITS.MAX_ADDRESSES} addresses`
    }
  },

  loginCount: {
    type: Number,
    default: 0
  },

  lastLoginAt: Date,

  accountCreatedAt: {
    type: Date,
    default: Date.now
  },

  metadata: {
    userAgent: String,
    referrer: String,
    campaign: String,
    source: String,
    medium: String,
    utmParameters: {
      type: Map,
      of: String
    },
    deviceFingerprint: String,
    initialCountry: String,
    signupFlow: String
  },

  subscription: {
    plan: String,
    status: String,
    expiresAt: Date,
    features: [String]
  },

  apiKeys: [{
    key: {
      type: String,
      select: false
    },
    name: String,
    permissions: [String],
    lastUsed: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  sessions: [{
    sessionId: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  auditLog: [{
    action: String,
    details: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
};
