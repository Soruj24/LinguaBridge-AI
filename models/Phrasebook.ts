import mongoose from "mongoose";

const PhrasebookEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  languageFrom: { type: String, required: true },
  languageTo: { type: String, required: true },
  sourceMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  sourceChatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
  notes: { type: String, default: "" },
  tags: [{ type: String }],
}, { timestamps: true });

PhrasebookEntrySchema.index({ userId: 1, createdAt: -1 });
PhrasebookEntrySchema.index({ userId: 1, tags: 1 });

export default mongoose.models.PhrasebookEntry || mongoose.model("PhrasebookEntry", PhrasebookEntrySchema);
