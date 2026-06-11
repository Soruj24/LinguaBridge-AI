import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    await connectDB();

    const query: Record<string, unknown> = {
      senderId: session.user.id,
      status: "scheduled",
    };
    if (chatId) {
      query.chatId = chatId;
    }

    const messages = await Message.find(query)
      .sort({ scheduledAt: 1 })
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar")
      .populate({
        path: "replyTo",
        populate: { path: "senderId", select: "name" },
      });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
