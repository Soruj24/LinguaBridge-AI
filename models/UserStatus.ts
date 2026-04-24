import mongoose from "mongoose";

const UserStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  typingIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
}, { timestamps: true });

export default mongoose.models.UserStatus || mongoose.model("UserStatus", UserStatusSchema);