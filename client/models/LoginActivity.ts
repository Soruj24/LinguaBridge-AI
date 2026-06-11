import mongoose from "mongoose";

const LoginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
    },
    os: {
      type: String,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    type: {
      type: String,
      enum: ["login", "logout", "signup", "password_change", "2fa_enabled", "2fa_disabled"],
      default: "login",
    },
    success: {
      type: Boolean,
      default: true,
    },
    failureReason: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github", "apple"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

LoginActivitySchema.index({ userId: 1, timestamp: -1 });
LoginActivitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.LoginActivity || mongoose.model("LoginActivity", LoginActivitySchema);