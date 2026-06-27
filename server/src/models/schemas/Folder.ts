import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FolderSchema.pre("save", function (next) { (this as any).updatedAt = new Date(); next(); });

export default mongoose.models.Folder || mongoose.model("Folder", FolderSchema);
