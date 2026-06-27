import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import User from "../models/schemas/User";
import { UserStatus } from "../types/enums";
import { ChatMessage, Chat } from "../models/chat";
import { extractTokenUser } from "../middleware/auth/tokenAuth";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super_admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: UserStatus.ACTIVE });
  const totalMessages = await ChatMessage.countDocuments();
  const totalChats = await Chat.countDocuments();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  res.json({ totalUsers, activeUsers, newUsers, totalMessages, totalChats });
});

router.get("/users", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super_admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { page = "1", limit = "15", q, role, isActive } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ username: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  if (role) filter.role = role;
  if (isActive !== undefined) filter.status = isActive === "true" ? UserStatus.ACTIVE : UserStatus.INACTIVE;

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean();
  const total = await User.countDocuments(filter);

  res.json({ data: users, meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
});

router.put("/users", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser || (tokenUser.role !== "admin" && tokenUser.role !== "super_admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { userId, ...updates } = req.body;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  const restricted = ["password", "email"];
  restricted.forEach((f) => delete updates[f]);

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select("-password");
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ message: "User updated", user });
});

export default router;
