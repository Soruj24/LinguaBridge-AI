import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
    groupDescription: {
      type: String,
    },
    groupAvatar: {
      type: String,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
