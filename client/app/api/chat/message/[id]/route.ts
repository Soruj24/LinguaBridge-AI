import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getIO } from "@/lib/socket-io";

const EDIT_MESSAGE_TIMEOUT_MINUTES = 10;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(id).populate("senderId");

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const senderEmail = message.senderId?.email;
    if (senderEmail !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const elapsed = Date.now() - new Date(message.createdAt).getTime();
    const maxAge = EDIT_MESSAGE_TIMEOUT_MINUTES * 60 * 1000;
    if (elapsed > maxAge) {
      return NextResponse.json(
        { error: "Edit window has expired" },
        { status: 400 },
      );
    }

    message.originalText = text.trim();
    message.editedAt = new Date();
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .populate("replyTo")
      .lean();

    const io = getIO();
    if (io) {
      io.to(message.chatId.toString()).emit("message_edited", updatedMessage);
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Edit message error:", error);
    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectDB();

    const message = await Message.findById(id).populate("senderId");

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if senderId is populated and has email
    const senderEmail = message.senderId?.email;

    if (senderEmail !== session.user.email && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Message.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
