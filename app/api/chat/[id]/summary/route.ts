import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { summarizeChat } from "@/lib/ai";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();

    const chat = await Chat.findById(id).populate("participants");
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify participant
    const isParticipant = chat.participants.some(
      (p: { email: string }) => p.email === session.user?.email,
    );

    if (!isParticipant && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get user's preferred language
    const user = chat.participants.find(
      (p: { email: string }) => p.email === session.user?.email,
    );
    const preferredLanguage =
      user?.preferredLanguage || session.user.preferredLanguage || "en";

    // Get last 50 messages for summary
    const messages = await Message.find({ chatId: id })
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedMessages = messages.reverse().map((msg) => {
      const isMe =
        user && msg.senderId.toString() === user._id.toString() && isParticipant;
      const text = isMe
        ? msg.originalText
        : msg.translatedText || msg.originalText;

      return {
        text,
        sender: isMe ? "me" : "other",
      };
    });

    const summary = await summarizeChat(formattedMessages, preferredLanguage);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
