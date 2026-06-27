import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    preferredLanguage: {
      type: String,
      default: "en",
    },
    showLastSeen: {
      type: Boolean,
      default: true,
    },
    showTypingIndicator: {
      type: Boolean,
      default: true,
    },
    showReadReceipts: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: "default",
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    twoFactorRecoveryCodes: [String],
    emailPreferences: {
      marketing: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
    notificationPreferences: {
      enabledTypes: {
        type: [String],
        enum: ["messages", "friend_requests", "group_invites", "calls", "security_alerts", "system_updates"],
        default: ["messages", "friend_requests", "group_invites", "calls", "security_alerts", "system_updates"],
      },
      doNotDisturb: {
        enabled: { type: Boolean, default: false },
        startTime: { type: String, default: "22:00" },
        endTime: { type: String, default: "08:00" },
      },
      sound: { type: String, enum: ["default", "chime", "bell", "none"], default: "default" },
      vibration: { type: Boolean, default: true },
      showPreview: { type: Boolean, default: true },
    },
    preferences: {
      lowBandwidth: { type: Boolean, default: false },
      reduceMotion: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      autoPlayAudio: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.ChatUser || mongoose.model("ChatUser", UserSchema);
