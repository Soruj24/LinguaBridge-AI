import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

    await connectDB();

    const chat = await Chat.findById(id).populate(
      "participants",
      "name email avatar preferredLanguage",
    );
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Authorization: allow participants or admins
    const isParticipant = chat.participants.some(
      (p: { email: string }) => p.email === session.user?.email,
    );
    if (!isParticipant && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const query: { chatId: string; createdAt?: { $lt: Date } } = { chatId: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");

    return NextResponse.json({
      chat,
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    await connectDB();

    const chat = await Chat.findById(id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await Message.deleteMany({ chatId: id });
    await Chat.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
