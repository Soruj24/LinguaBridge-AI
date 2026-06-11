import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    color: { type: String, default: "gray" },
    order: { type: Number, default: 0 },
    chatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  },
  { timestamps: true }
);

FolderSchema.index({ userId: 1, order: 1 });

export default mongoose.models.Folder || mongoose.model("Folder", FolderSchema);
