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

    const query: Record<string, unknown> = { chatId: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    query.$or = [
      { status: { $ne: "scheduled" } },
      { status: "scheduled", senderId: session.user.id },
    ];

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .populate({
        path: "replyTo",
        populate: { path: "senderId", select: "name" },
      });

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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    await connectDB();

    const chat = await Chat.findById(id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: { _id: { toString: () => string } }) =>
        p._id.toString() === session.user?.id,
    );
    if (!isParticipant && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.action === "clear") {
      await Message.deleteMany({ chatId: id });
      return NextResponse.json({ success: true });
    }

    if (body.hasOwnProperty("alwaysTranslate")) {
      chat.alwaysTranslate = body.alwaysTranslate;
      chat.autoTranslateLanguage = body.autoTranslateLanguage ?? null;
      await chat.save();
      return NextResponse.json({ chat });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error clearing chat:", error);
    return NextResponse.json(
      { error: "Failed to clear chat" },
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
