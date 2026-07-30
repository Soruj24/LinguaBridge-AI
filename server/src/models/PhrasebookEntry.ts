import mongoose from "mongoose";

const PhrasebookEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true },
  category: { type: String, default: "general" },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PhrasebookEntrySchema.pre("save", function (next) { (this as any).updatedAt = new Date(); next(); });

export default mongoose.models.PhrasebookEntry || mongoose.model("PhrasebookEntry", PhrasebookEntrySchema);
