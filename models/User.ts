import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Optional for OAuth
    },
    avatar: {
      type: String,
    },
    preferredLanguage: {
      type: String,
      default: "en", // Default language
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
