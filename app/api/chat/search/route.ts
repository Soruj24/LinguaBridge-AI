import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const chatId = searchParams.get("chatId");

    if (!query) {
      return NextResponse.json({ error: "Search query required" }, { status: 400 });
    }

    await connectDB();

    const baseQuery: Record<string, unknown> = {
      $or: [
        { originalText: { $regex: query, $options: "i" } },
        { translatedText: { $regex: query, $options: "i" } },
      ],
    };

    if (chatId) {
      baseQuery.chatId = chatId;
    }

    const messages = await Message.find(baseQuery)
      .populate("senderId", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}