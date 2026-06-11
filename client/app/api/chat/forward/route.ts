import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { getIO } from "@/lib/socket-io";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, targetChatId } = await req.json();
    if (!messageId || !targetChatId) {
      return NextResponse.json(
        { error: "messageId and targetChatId are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sourceMessage = await Message.findById(messageId)
      .populate("senderId", "name email avatar")
      .lean();

    if (!sourceMessage || sourceMessage.isDeleted) {
      return NextResponse.json(
        { error: "Message not found or has been deleted" },
        { status: 404 },
      );
    }

    const sourceChat = await Chat.findById(sourceMessage.chatId);
    if (!sourceChat) {
      return NextResponse.json({ error: "Source chat not found" }, { status: 404 });
    }

    const isInSourceChat = sourceChat.participants.some(
      (p: { toString: () => string }) => p.toString() === currentUser._id.toString(),
    );
    if (!isInSourceChat) {
      return NextResponse.json(
        { error: "You are not a participant in the source chat" },
        { status: 403 },
      );
    }

    const targetChat = await Chat.findById(targetChatId)
      .populate("participants", "name email avatar preferredLanguage");

    if (!targetChat) {
      return NextResponse.json({ error: "Target chat not found" }, { status: 404 });
    }

    const isInTargetChat = targetChat.participants.some(
      (p: { _id: { toString: () => string } }) => p._id.toString() === currentUser._id.toString(),
    );
    if (!isInTargetChat) {
      return NextResponse.json(
        { error: "You are not a participant in the target chat" },
        { status: 403 },
      );
    }

    const targetReceiver = targetChat.participants.find(
      (p: { _id: { toString: () => string } }) => p._id.toString() !== currentUser._id.toString(),
    );

    const forwardedText = `Forwarded from ${sourceMessage.senderId.name}\n${sourceMessage.originalText}`;

    const newMessage = await Message.create({
      chatId: targetChatId,
      senderId: currentUser._id,
      receiverId: targetReceiver?._id || currentUser._id,
      originalText: forwardedText,
      fileUrl: sourceMessage.fileUrl,
      fileType: sourceMessage.fileType,
      fileSize: sourceMessage.fileSize,
      isImage: sourceMessage.isImage,
      voiceUrl: sourceMessage.voiceUrl,
      languageFrom: sourceMessage.languageFrom,
      languageTo: targetReceiver?.preferredLanguage,
    });

    await Chat.findByIdAndUpdate(targetChatId, {
      lastMessage: newMessage._id,
      updatedAt: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .lean();

    const io = getIO();
    if (io) {
      io.to(targetChatId).emit("receive_message", populatedMessage);
    }

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("Forward message error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
