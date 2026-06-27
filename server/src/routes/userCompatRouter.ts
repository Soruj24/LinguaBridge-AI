import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { ChatUser } from "../models/chat";
import { extractTokenUser } from "../middleware/auth/tokenAuth";

const router = Router();

router.put("/update", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await ChatUser.findOne({ email: tokenUser.email.toLowerCase() });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const updates = req.body;
  const allowed = ["name", "avatar", "preferredLanguage", "bio", "theme", "showLastSeen", "showTypingIndicator", "showReadReceipts"];
  const set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) set[key] = updates[key];
  }

  if (Object.keys(set).length > 0) {
    await ChatUser.findByIdAndUpdate(user._id, { $set: set });
  }

  const updated = await ChatUser.findById(user._id).lean();
  res.json({ success: true, user: updated });
});

export default router;
