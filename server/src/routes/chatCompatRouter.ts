import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import connectDB from "../config/connectDB";
import { Chat, ChatMessage, Friendship, Block } from "../models/chat";
import { findOrCreateChatUser } from "../utils/syncUser";
import { processTranslationPipeline } from "../services/ai";
import { textToSpeech, transcribeAudio } from "../services/ai";
import { generateSmartReplies } from "../services/ai";
import { rewriteText } from "../services/ai";
import { extractTokenUser } from "../middleware/tokenAuth";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1020 } });

async function resolveUser(req: Request) {
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) return null;
  return findOrCreateChatUser({ email: tokenUser.email, name: req.headers["x-user-name"] as string, avatar: req.headers["x-user-avatar"] as string });
}

function requireUser(res: Response): null {
  res.status(401).json({ error: "Unauthorized" });
  return null;
}

// â”€â”€ List chats â”€â”€
router.get("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.json([]); return; }

  const { search, paginate, page = "1", limit = "50", sortBy = "updatedAt" } = req.query;
  const query: Record<string, unknown> = { participants: user._id };

  if (search) {
    const matchingUsers = await (await import("../models/chat")).ChatUser.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    const userIds = matchingUsers.map((u: { _id: unknown }) => u._id);
    query.participants = { $in: [user._id], $elemMatch: { $in: userIds } };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const chats = await Chat.find(query)
    .populate("participants", "name email avatar preferredLanguage")
    .populate({ path: "lastMessage", populate: { path: "senderId", select: "name" } })
    .sort({ [sortBy as string]: -1 })
    .skip(paginate === "true" ? skip : 0)
    .limit(paginate === "true" ? limitNum : 100)
    .lean();

  if (paginate === "true") {
    const total = await Chat.countDocuments(query);
    res.json({ chats, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } else {
    res.json(chats);
  }
});

// â”€â”€ Get messages for a chat â”€â”€
router.get("/:chatId", async (req: Request, res: Response) => {
  await connectDB();
  const { chatId } = req.params;
  const { limit = "20", before } = req.query;

  const query: Record<string, unknown> = { chatId };
  if (before) {
    const beforeMsg = await ChatMessage.findById(before);
    if (beforeMsg) query.createdAt = { $lt: beforeMsg.createdAt };
  }

  const messages = await ChatMessage.find(query)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar")
    .populate({ path: "replyTo", populate: { path: "senderId", select: "name" } })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string))
    .lean();

  const chat = await Chat.findById(chatId)
    .populate("participants", "name email avatar preferredLanguage")
    .lean();

  const hasMore = messages.length === parseInt(limit as string);

  res.json({ messages: messages.reverse(), chat, hasMore });
});

// â”€â”€ Create chat â”€â”€
router.post("/", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { receiverId } = req.body;
  if (!receiverId) { res.status(400).json({ error: "receiverId is required" }); return; }

  const existing = await Chat.findOne({
    participants: { $all: [user._id, receiverId] },
    isGroup: false,
  });

  if (existing) {
    const populated = await Chat.findById(existing._id)
      .populate("participants", "name email avatar preferredLanguage")
      .populate({ path: "lastMessage", populate: { path: "senderId", select: "name" } })
      .lean();
    res.json(populated);
    return;
  }

  const chat = await Chat.create({ participants: [user._id, receiverId], isGroup: false });
  const populated = await Chat.findById(chat._id)
    .populate("participants", "name email avatar preferredLanguage");
  res.status(201).json(populated);
});

// â”€â”€ Mark messages as read â”€â”€
router.post("/read", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { chatId, messageIds } = req.body;
  if (messageIds?.length > 0) {
    await ChatMessage.updateMany({ _id: { $in: messageIds }, chatId }, { $addToSet: { readBy: user._id } });
  }
  res.json({ success: true });
});

// â”€â”€ Forward message â”€â”€
router.post("/forward", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { messageId, targetChatId } = req.body;
  const original = await ChatMessage.findById(messageId);
  if (!original) { res.status(404).json({ error: "Message not found" }); return; }

  const newMsg = await ChatMessage.create({
    chatId: targetChatId, senderId: user._id,
    originalText: original.originalText, translatedText: original.translatedText,
    languageFrom: original.languageFrom, languageTo: original.languageTo,
    voiceUrl: original.voiceUrl, fileUrl: original.fileUrl, fileType: original.fileType,
    isImage: original.isImage, status: "sent",
  });

  await Chat.findByIdAndUpdate(targetChatId, { lastMessage: newMsg._id, updatedAt: new Date() });
  const populated = await ChatMessage.findById(newMsg._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");
  res.status(201).json(populated);
});

// â”€â”€ TTS â”€â”€
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: "text is required" }); return; }
    const audioBuffer = await textToSpeech(text);
    res.set({ "Content-Type": "audio/mpeg", "Content-Length": audioBuffer.length });
    res.send(audioBuffer);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    res.status(500).json({ error: msg });
  }
});

// â”€â”€ Voice message (upload + transcribe) â”€â”€
router.post("/voice", upload.single("file"), async (req: Request, res: Response) => {
  await connectDB();
  try {
    const user = await resolveUser(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { chatId, receiverId } = req.body;
    const file = req.file;
    if (!file) { res.status(400).json({ error: "file is required" }); return; }

    const transcribed = await transcribeAudio(file.path);
    const result = await processTranslationPipeline(transcribed, "en");

    const receiver = await (await import("../models/chat")).ChatUser.findById(receiverId);
    const message = await ChatMessage.create({
      chatId, senderId: user._id, receiverId,
      originalText: transcribed, translatedText: result.translated,
      phoneticText: result.phonetic,
      languageFrom: result.detectedLanguage, languageTo: receiver?.preferredLanguage || "en",
      voiceUrl: `/uploads/${file.filename}`, status: "sent",
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });
    const populated = await ChatMessage.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");
    res.status(201).json(populated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Voice processing failed";
    res.status(500).json({ error: msg });
  }
});

// â”€â”€ File message (upload) â”€â”€
router.post("/file", upload.single("file"), async (req: Request, res: Response) => {
  await connectDB();
  try {
    const user = await resolveUser(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { chatId, receiverId } = req.body;
    const file = req.file;
    if (!file) { res.status(400).json({ error: "file is required" }); return; }

    const fileUrl = `/uploads/${file.filename}`;
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    const message = await ChatMessage.create({
      chatId, senderId: user._id, receiverId,
      originalText: file.originalname,
      translatedText: file.originalname,
      languageFrom: "und", languageTo: "und",
      fileUrl, fileType: file.mimetype,
      fileName: file.originalname, fileSize: file.size,
      status: "sent",
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });
    const populated = await ChatMessage.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");
    res.status(201).json(populated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "File upload failed";
    res.status(500).json({ error: msg });
  }
});

// â”€â”€ Rewrite text â”€â”€
router.post("/rewrite", async (req: Request, res: Response) => {
  try {
    const { text, tone } = req.body;
    if (!text) { res.status(400).json({ error: "text is required" }); return; }
    const rewritten = await rewriteText(text, tone || "professional", "en");
    res.json({ rewritten });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Rewrite failed";
    res.status(500).json({ error: msg });
  }
});

// â”€â”€ Group chat â”€â”€
router.post("/group", upload.single("avatar"), async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { name, description, participantIds } = req.body;
  const ids = JSON.parse(participantIds || "[]");
  if (!name || ids.length === 0) { res.status(400).json({ error: "name and participants required" }); return; }

  const chat = await Chat.create({
    isGroup: true, groupName: name, groupDescription: description,
    groupAvatar: req.file ? `/uploads/${req.file.filename}` : undefined,
    groupAdmin: user._id, participants: [user._id, ...ids],
  });

  const populated = await Chat.findById(chat._id)
    .populate("participants", "name email avatar preferredLanguage");
  res.status(201).json(populated);
});

// â”€â”€ Scheduled messages â”€â”€
router.get("/scheduled", async (req: Request, res: Response) => {
  await connectDB();
  const { chatId } = req.query;
  if (!chatId) { res.json([]); return; }
  const messages = await ChatMessage.find({ chatId, status: "scheduled" })
    .sort({ scheduledAt: 1 }).lean();
  res.json(messages);
});

router.post("/schedule", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { chatId, text, scheduledAt } = req.body;
  const chat = await Chat.findById(chatId).lean();
  const receiverId = chat?.participants?.find((p: mongoose.Types.ObjectId) => p.toString() !== user._id.toString());

  const message = await ChatMessage.create({
    chatId, senderId: user._id, receiverId,
    originalText: text, languageFrom: "en", languageTo: "en",
    scheduledAt: new Date(scheduledAt), status: "scheduled",
  });
  res.status(201).json(message);
});

router.delete("/scheduled/:messageId", async (req: Request, res: Response) => {
  await connectDB();
  await ChatMessage.findByIdAndDelete(req.params.messageId);
  res.json({ success: true });
});

// â”€â”€ Search messages â”€â”€
router.get("/search", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.json([]); return; }

  const { q, chatId } = req.query;
  if (!q) { res.json([]); return; }

  const query: Record<string, unknown> = {
    $or: [
      { originalText: { $regex: q, $options: "i" } },
      { translatedText: { $regex: q, $options: "i" } },
    ],
  };
  if (chatId) query.chatId = chatId;
  else {
    const userChats = await Chat.find({ participants: user._id }).select("_id");
    query.chatId = { $in: userChats.map((c) => c._id) };
  }

  const messages = await ChatMessage.find(query)
    .populate("senderId", "name email avatar")
    .populate("chatId")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(messages);
});

// â”€â”€ GIFs (Tenor) â”€â”€
router.get("/gifs", async (req: Request, res: Response) => {
  const { q } = req.query;
  const apiKey = process.env.TENOR_API_KEY;
  if (!apiKey || apiKey === "your-tenor-api-key") {
    res.json([]);
    return;
  }
  try {
    const resp = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q as string)}&key=${apiKey}&limit=20&media_filter=tinygif`
    );
    const data = await resp.json() as { results?: Array<{ media_formats?: { tinygif?: { url: string } } }> };
    const gifs = (data.results || [])
      .map((r) => r.media_formats?.tinygif?.url)
      .filter(Boolean);
    res.json(gifs);
  } catch {
    res.json([]);
  }
});

// â”€â”€ Voice translate â”€â”€
router.post("/voice-translate", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: "file is required" }); return; }

    const transcribed = await transcribeAudio(file.path);
    const { translateVoice } = await import("../services/ai");
    const audioBuffer = await translateVoice(transcribed);

    res.set({ "Content-Type": "audio/mpeg", "Content-Length": audioBuffer.length });
    res.send(audioBuffer);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Voice translate failed";
    res.status(500).json({ error: msg });
  }
});

// â”€â”€ Edit message â”€â”€
router.patch("/message/:messageId", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { text } = req.body;
  const message = await ChatMessage.findById(req.params.messageId);
  if (!message) { res.status(404).json({ error: "Not found" }); return; }
  if (message.senderId.toString() !== user._id.toString()) { res.status(403).json({ error: "Forbidden" }); return; }

  message.originalText = text;
  message.editedAt = new Date();
  await message.save();

  const populated = await ChatMessage.findById(message._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");
  res.json(populated);
});

// â”€â”€ Delete message â”€â”€
router.delete("/message/:messageId", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const message = await ChatMessage.findById(req.params.messageId);
  if (!message) { res.status(404).json({ error: "Not found" }); return; }
  if (message.senderId.toString() !== user._id.toString()) { res.status(403).json({ error: "Forbidden" }); return; }

  message.isDeleted = true;
  message.originalText = "This message has been deleted";
  message.translatedText = undefined;
  await message.save();
  res.json({ success: true });
});

// â”€â”€ Pin/unpin â”€â”€
router.post("/message/:messageId/pin", async (req: Request, res: Response) => {
  await connectDB();
  const { action } = req.body;
  const message = await ChatMessage.findById(req.params.messageId);
  if (!message) { res.status(404).json({ error: "Not found" }); return; }

  message.isPinned = action === "pin";
  await message.save();
  res.json({ success: true, isPinned: message.isPinned });
});

// â”€â”€ React to message â”€â”€
router.post("/message/:messageId/react", async (req: Request, res: Response) => {
  await connectDB();
  const user = await resolveUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { emoji } = req.body;
  const message = await ChatMessage.findById(req.params.messageId);
  if (!message) { res.status(404).json({ error: "Not found" }); return; }

  const idx = message.reactions.findIndex(
    (r: { userId: { toString(): string }; emoji: string }) =>
      r.userId.toString() === user._id.toString() && r.emoji === emoji
  );

  if (idx >= 0) message.reactions.splice(idx, 1);
  else message.reactions.push({ emoji, userId: user._id });

  await message.save();
  res.json({ success: true, reactions: message.reactions });
});

// â”€â”€ Smart replies / suggestions â”€â”€
router.post("/:chatId/suggestions", async (req: Request, res: Response) => {
  await connectDB();
  const { chatId } = req.params;

  const messages = await ChatMessage.find({ chatId })
    .populate("senderId", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const user = await resolveUser(req);
  const formatted = messages.reverse().map((m) => ({
    text: m.originalText,
    sender: m.senderId?.toString() === user?._id?.toString() ? "me" as const : "other" as const,
  }));

  const suggestions = await generateSmartReplies(formatted, user?.preferredLanguage || "en");
  res.json({ suggestions });
});

// â”€â”€ Update chat settings / clear / archive â”€â”€
router.patch("/:chatId", async (req: Request, res: Response) => {
  await connectDB();
  const { chatId } = req.params;
  const { alwaysTranslate, autoTranslateLanguage, action } = req.body;

  if (action === "clear") {
    await ChatMessage.deleteMany({ chatId });
    await Chat.findByIdAndUpdate(chatId, { lastMessage: null });
    res.json({ success: true });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (alwaysTranslate !== undefined) updates.alwaysTranslate = alwaysTranslate;
  if (autoTranslateLanguage !== undefined) updates.autoTranslateLanguage = autoTranslateLanguage;

  if (Object.keys(updates).length > 0) {
    await Chat.findByIdAndUpdate(chatId, updates);
  }
  res.json({ success: true });
});

// â”€â”€ Delete chat â”€â”€
router.delete("/:chatId", async (req: Request, res: Response) => {
  await connectDB();
  await ChatMessage.deleteMany({ chatId: req.params.chatId });
  await Chat.findByIdAndDelete(req.params.chatId);
  res.json({ success: true });
});

// â”€â”€ Export chat â”€â”€
router.get("/:chatId/export", async (req: Request, res: Response) => {
  await connectDB();
  const { chatId } = req.params;
  const format = req.query.format || "json";

  const messages = await ChatMessage.find({ chatId })
    .populate("senderId", "name email")
    .sort({ createdAt: 1 })
    .lean();

  if (format === "txt") {
    const text = messages.map((m) => {
      const name = typeof m.senderId === "object" && m.senderId !== null ? (m.senderId as { name?: string }).name || "Unknown" : "Unknown";
      const date = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";
      return `[${date}] ${name}: ${m.originalText}`;
    }).join("\n");
    res.set({ "Content-Type": "text/plain", "Content-Disposition": `attachment; filename="chat-${chatId}.txt"` });
    res.send(text);
  } else {
    res.set({ "Content-Type": "application/json", "Content-Disposition": `attachment; filename="chat-${chatId}.json"` });
    res.json(messages);
  }
});

// â”€â”€ Archive/unarchive â”€â”€
router.post("/:chatId/archive", async (req: Request, res: Response) => {
  await connectDB();
  const { action } = req.body;
  await Chat.findByIdAndUpdate(req.params.chatId, {
    isArchived: action === "archive",
    archivedAt: action === "archive" ? new Date() : null,
  });
  res.json({ success: true });
});

export default router;

