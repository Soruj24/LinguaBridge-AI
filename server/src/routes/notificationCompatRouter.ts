import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import Notification from "../models/schemas/Notification";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    await connectDB();
    const user = extractTokenUser(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { id, all } = req.query;
  if (all === "true") {
    await Notification.updateMany({ userId: user._id, isRead: false }, { $set: { isRead: true } });
  } else if (id) {
    await Notification.findOneAndUpdate({ _id: id, userId: user._id }, { $set: { isRead: true } });
  }
  res.json({ message: "Updated" });
});

router.post("/subscribe", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { endpoint, keys } = req.body;
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }

  try {
    const db = (await import("mongoose")).default.connection.db;
    await db!.collection("push_subscriptions").updateOne(
      { userId: user._id, endpoint },
      { $set: { userId: user._id, endpoint, keys, createdAt: new Date() } },
      { upsert: true }
    );
    res.json({ message: "Subscribed" });
  } catch {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.post("/unsubscribe", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const db = (await import("mongoose")).default.connection.db;
    await db!.collection("push_subscriptions").deleteMany({ userId: user._id });
    res.json({ message: "Unsubscribed" });
  } catch {
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
