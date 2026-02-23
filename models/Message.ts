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
      required: true,
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
      type: String, // Path to original voice file if any
    },
    translatedVoiceUrl: {
      type: String, // Path to translated voice file if any
    },
    phoneticText: {
      type: String, // IPA or transliteration
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
