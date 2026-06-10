import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import { getIO } from "@/lib/socket-io";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !["pin", "unpin"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(id).populate("senderId", "name email avatar");
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const chat = await Chat.findById(message.chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: { toString: () => string }) => p.toString() === session.user?.id,
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    message.isPinned = action === "pin";
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .populate("replyTo")
      .lean();

    const io = getIO();
    if (io) {
      io.to(message.chatId.toString()).emit("message_pinned", {
        messageId: message._id,
        isPinned: message.isPinned,
        message: updatedMessage,
      });
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Pin message error:", error);
    return NextResponse.json(
      { error: "Failed to pin message" },
      { status: 500 },
    );
  }
}
