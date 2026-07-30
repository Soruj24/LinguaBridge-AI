import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/tokenAuth";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const db = (await import("mongoose")).default.connection.db;
    const { targetType, targetId, reason, description } = req.body;
    await db!.collection("reports").insertOne({
      reporterId: user._id,
      targetType, targetId, reason, description,
      status: "pending",
      createdAt: new Date(),
    });
    res.status(201).json({ message: "Report submitted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;

