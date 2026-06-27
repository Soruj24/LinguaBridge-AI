import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import Folder from "../models/schemas/Folder";
import Chat from "../models/chat/Chat";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const folders = await Folder.find({ user: user._id }).sort({ name: 1 }).lean();

  const populated = await Promise.all(
    folders.map(async (folder: Record<string, unknown>) => {
      const chatIds = ((folder.chats || []) as Array<{ toString(): string }>).map((c) => c.toString());
      const chats = chatIds.length > 0
        ? await Chat.find({ _id: { $in: chatIds } }).select("_id title lastMessage").lean()
        : [];
      return { ...folder, chats };
    })
  );

  res.json({ folders: populated });
});

router.post("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const folder = await Folder.create({ ...req.body, user: user._id, chats: [] });
  res.status(201).json({ folder });
});

router.put("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { folderId, name } = req.body;
  if (!folderId) { res.status(400).json({ error: "folderId required" }); return; }

  const folder = await Folder.findOneAndUpdate(
    { _id: folderId, user: user._id },
    { $set: { name } },
    { new: true }
  );
  if (!folder) { res.status(404).json({ error: "Folder not found" }); return; }
  res.json({ folder });
});

router.delete("/:folderId", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  await Folder.findOneAndDelete({ _id: req.params.folderId, user: user._id });
  res.json({ message: "Deleted" });
});

router.patch("/:folderId", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const folder = await Folder.findOneAndUpdate(
    { _id: req.params.folderId, user: user._id },
    { $set: req.body },
    { new: true }
  );
  if (!folder) { res.status(404).json({ error: "Folder not found" }); return; }
  res.json({ folder });
});

router.post("/:folderId/chats", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { chatId } = req.body;
  if (!chatId) { res.status(400).json({ error: "chatId required" }); return; }

  await Folder.findOneAndUpdate({ _id: req.params.folderId, user: user._id }, { $addToSet: { chats: chatId } });
  res.json({ message: "Chat added to folder" });
});

router.delete("/:folderId/chats", async (req: Request, res: Response) => {
  await connectDB();
  const user = extractTokenUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { chatId } = req.body;
  if (!chatId) { res.status(400).json({ error: "chatId required" }); return; }

  await Folder.findOneAndUpdate({ _id: req.params.folderId, user: user._id }, { $pull: { chats: chatId } });
  res.json({ message: "Chat removed from folder" });
});

export default router;
