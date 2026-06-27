import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
    },
  },
  { timestamps: true }
);

BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export default mongoose.models.Block || mongoose.model("Block", BlockSchema);
