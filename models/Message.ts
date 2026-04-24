import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    originalText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String,
    },
    languageFrom: {
      type: String,
      required: true,
    },
    languageTo: {
      type: String,
      required: true,
    },
    voiceUrl: {
      type: String,
    },
    translatedVoiceUrl: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    isImage: {
      type: Boolean,
      default: false,
    },
    phoneticText: {
      type: String,
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
