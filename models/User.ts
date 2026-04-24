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
    theme: {
      type: String,
      default: "default",
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
