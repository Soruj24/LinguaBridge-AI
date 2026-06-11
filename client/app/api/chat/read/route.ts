import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, messageIds } = await req.json();

    await connectDB();

    if (messageIds && messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageIds }, receiverId: session.user.id },
        { $addToSet: { readBy: session.user.id } }
      );
    }

    if (chatId) {
      await Message.updateMany(
        { chatId, receiverId: session.user.id, readBy: { $ne: session.user.id } },
        { $addToSet: { readBy: session.user.id } }
      );

      await Chat.findByIdAndUpdate(chatId, { unreadCount: 0 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}