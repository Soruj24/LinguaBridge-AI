import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import User from "../models/schemas/User";

const router = Router();

router.get("/me", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(tokenUser._id).select("-password").lean();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

router.get("/notification-preferences", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(tokenUser._id).select("notificationPreferences").lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json({ preferences: (user as any)?.notificationPreferences || { email: true, push: true, inApp: true } });
});

router.put("/notification-preferences", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findByIdAndUpdate(tokenUser._id, { $set: { notificationPreferences: req.body } }, { new: true }).select("notificationPreferences");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json({ preferences: (user as any)?.notificationPreferences });
});

router.get("/export", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(tokenUser._id).select("-password").lean();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="linguabridge-data-${tokenUser._id}.json"`);
  res.json(user);
});

export default router;
