import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import PhrasebookEntry from "../models/schemas/PhrasebookEntry";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const entries = await PhrasebookEntry.find({ user: user._id }).sort({ createdAt: -1 }).lean();
  res.json({ entries });
});

router.post("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const entry = await PhrasebookEntry.create({ ...req.body, user: user._id });
  res.status(201).json({ entry });
});

router.delete("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    res.status(400).json({ error: "ids array required" });
    return;
  }

  await PhrasebookEntry.deleteMany({ _id: { $in: ids }, user: user._id });
  res.json({ message: "Deleted" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  await PhrasebookEntry.findOneAndDelete({ _id: req.params.id, user: user._id });
  res.json({ message: "Deleted" });
});

router.patch("/:id", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const entry = await PhrasebookEntry.findOneAndUpdate(
    { _id: req.params.id, user: user._id },
    { $set: req.body },
    { new: true }
  );
  if (!entry) { res.status(404).json({ error: "Entry not found" }); return; }
  res.json({ entry });
});

export default router;
