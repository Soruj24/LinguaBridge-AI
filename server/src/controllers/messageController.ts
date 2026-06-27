import { Request, Response } from "express";
import connectDB from "../config/connectDB";
import { Chat, ChatMessage, Friendship, Block } from "../models/chat";

export async function getChats(req: Request, res: Response) {
  await connectDB();
  const { userId } = req.params;
  const { page = "1", limit = "20" } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "name email avatar preferredLanguage")
    .populate({
      path: "lastMessage",
      populate: { path: "senderId", select: "name" },
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Chat.countDocuments({ participants: userId });

  res.json({
    success: true,
    data: chats,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function getMessages(req: Request, res: Response) {
  await connectDB();
  const { chatId } = req.params;
  const { page = "1", limit = "50" } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const messages = await ChatMessage.find({ chatId })
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar")
    .populate({
      path: "replyTo",
      populate: { path: "senderId", select: "name" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await ChatMessage.countDocuments({ chatId });

  res.json({
    success: true,
    data: messages.reverse(),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function createChat(req: Request, res: Response) {
  await connectDB();
  const { participant1Id, participant2Id } = req.body;

  if (!participant1Id || !participant2Id) {
    res.status(400).json({ success: false, error: "Both participant IDs are required" });
    return;
  }

  const friendship = await Friendship.findOne({
    $or: [
      { requester: participant1Id, recipient: participant2Id, status: "accepted" },
      { requester: participant2Id, recipient: participant1Id, status: "accepted" },
    ],
  });

  if (!friendship) {
    res.status(403).json({ success: false, error: "Users must be friends to create a chat" });
    return;
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [participant1Id, participant2Id] },
    isGroup: false,
  });

  if (existingChat) {
    res.json({ success: true, data: existingChat });
    return;
  }

  const block = await Block.findOne({
    $or: [
      { blocker: participant1Id, blocked: participant2Id },
      { blocker: participant2Id, blocked: participant1Id },
    ],
  });

  if (block) {
    res.status(403).json({ success: false, error: "Cannot create chat with blocked user" });
    return;
  }

  const chat = await Chat.create({
    participants: [participant1Id, participant2Id],
    isGroup: false,
  });

  const populatedChat = await Chat.findById(chat._id)
    .populate("participants", "name email avatar preferredLanguage");

  res.status(201).json({ success: true, data: populatedChat });
}

export async function sendMessage(req: Request, res: Response) {
  await connectDB();
  const { chatId } = req.params;
  const { senderId, originalText, languageFrom, languageTo } = req.body;

  if (!senderId || !originalText) {
    res.status(400).json({ success: false, error: "senderId and originalText are required" });
    return;
  }

  const message = await ChatMessage.create({
    chatId,
    senderId,
    originalText,
    languageFrom: languageFrom || "en",
    languageTo: languageTo || "en",
    status: "sent",
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  const populatedMessage = await ChatMessage.findById(message._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");

  res.status(201).json({ success: true, data: populatedMessage });
}

export async function editMessage(req: Request, res: Response) {
  await connectDB();
  const { messageId } = req.params;
  const { originalText, senderId } = req.body;

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404).json({ success: false, error: "Message not found" });
    return;
  }

  if (message.senderId.toString() !== senderId) {
    res.status(403).json({ success: false, error: "Not authorized to edit this message" });
    return;
  }

  message.originalText = originalText;
  message.editedAt = new Date();
  await message.save();

  const populatedMessage = await ChatMessage.findById(message._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");

  res.json({ success: true, data: populatedMessage });
}

export async function deleteMessage(req: Request, res: Response) {
  await connectDB();
  const { messageId } = req.params;
  const { senderId } = req.body;

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404).json({ success: false, error: "Message not found" });
    return;
  }

  if (message.senderId.toString() !== senderId) {
    res.status(403).json({ success: false, error: "Not authorized to delete this message" });
    return;
  }

  message.isDeleted = true;
  message.originalText = "This message has been deleted";
  message.translatedText = undefined;
  await message.save();

  res.json({ success: true, message: "Message deleted" });
}

export async function markAsRead(req: Request, res: Response) {
  await connectDB();
  const { chatId } = req.params;
  const { userId, messageIds } = req.body;

  if (!userId) {
    res.status(400).json({ success: false, error: "userId is required" });
    return;
  }

  if (messageIds && messageIds.length > 0) {
    await ChatMessage.updateMany(
      { _id: { $in: messageIds }, chatId },
      { $addToSet: { readBy: userId } }
    );
  } else {
    await ChatMessage.updateMany(
      { chatId, senderId: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
  }

  res.json({ success: true, message: "Messages marked as read" });
}

export async function searchMessages(req: Request, res: Response) {
  await connectDB();
  const { userId } = req.params;
  const { q, page = "1", limit = "20" } = req.query;

  if (!q) {
    res.status(400).json({ success: false, error: "Search query is required" });
    return;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const userChats = await Chat.find({ participants: userId }).select("_id");
  const chatIds = userChats.map(chat => chat._id);

  const messages = await ChatMessage.find({
    chatId: { $in: chatIds },
    $or: [
      { originalText: { $regex: q, $options: "i" } },
      { translatedText: { $regex: q, $options: "i" } },
    ],
  })
    .populate("senderId", "name email avatar")
    .populate("chatId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await ChatMessage.countDocuments({
    chatId: { $in: chatIds },
    $or: [
      { originalText: { $regex: q, $options: "i" } },
      { translatedText: { $regex: q, $options: "i" } },
    ],
  });

  res.json({
    success: true,
    data: messages,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function forwardMessage(req: Request, res: Response) {
  await connectDB();
  const { messageId, targetChatId, senderId } = req.body;

  if (!messageId || !targetChatId || !senderId) {
    res.status(400).json({ success: false, error: "messageId, targetChatId, and senderId are required" });
    return;
  }

  const originalMessage = await ChatMessage.findById(messageId);
  if (!originalMessage) {
    res.status(404).json({ success: false, error: "Original message not found" });
    return;
  }

  const newMessage = await ChatMessage.create({
    chatId: targetChatId,
    senderId,
    originalText: originalMessage.originalText,
    translatedText: originalMessage.translatedText,
    languageFrom: originalMessage.languageFrom,
    languageTo: originalMessage.languageTo,
    voiceUrl: originalMessage.voiceUrl,
    fileUrl: originalMessage.fileUrl,
    fileType: originalMessage.fileType,
    isImage: originalMessage.isImage,
    status: "sent",
  });

  await Chat.findByIdAndUpdate(targetChatId, {
    lastMessage: newMessage._id,
    updatedAt: new Date(),
  });

  const populatedMessage = await ChatMessage.findById(newMessage._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");

  res.status(201).json({ success: true, data: populatedMessage });
}

export async function togglePinMessage(req: Request, res: Response) {
  await connectDB();
  const { messageId } = req.params;
  const { isPinned } = req.body;

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404).json({ success: false, error: "Message not found" });
    return;
  }

  message.isPinned = isPinned;
  await message.save();

  res.json({ success: true, data: message });
}

export async function toggleReaction(req: Request, res: Response) {
  await connectDB();
  const { messageId } = req.params;
  const { userId, emoji } = req.body;

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404).json({ success: false, error: "Message not found" });
    return;
  }

  const existingReaction = message.reactions.find(
    (r: { userId: { toString(): string }; emoji: string }) => r.userId.toString() === userId && r.emoji === emoji
  );

  if (existingReaction) {
    message.reactions = message.reactions.filter(
      (r: { userId: { toString(): string }; emoji: string }) => !(r.userId.toString() === userId && r.emoji === emoji)
    );
  } else {
    message.reactions.push({ emoji, userId });
  }

  await message.save();

  res.json({ success: true, data: message });
}

export async function getPinnedMessages(req: Request, res: Response) {
  await connectDB();
  const { chatId } = req.params;

  const messages = await ChatMessage.find({ chatId, isPinned: true })
    .populate("senderId", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: messages });
}

export async function scheduleMessage(req: Request, res: Response) {
  await connectDB();
  const { chatId } = req.params;
  const { senderId, receiverId, originalText, languageFrom, languageTo, scheduledAt } = req.body;

  if (!senderId || !receiverId || !originalText || !scheduledAt) {
    res.status(400).json({ 
      success: false, 
      error: "senderId, receiverId, originalText, and scheduledAt are required" 
    });
    return;
  }

  const message = await ChatMessage.create({
    chatId,
    senderId,
    receiverId,
    originalText,
    languageFrom: languageFrom || "en",
    languageTo: languageTo || "en",
    scheduledAt: new Date(scheduledAt),
    status: "scheduled",
  });

  res.status(201).json({ success: true, data: message });
}
