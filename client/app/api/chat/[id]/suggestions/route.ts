import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateSmartReplies } from "@/lib/ai";
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

    // Get last few messages for context
    const messages = await Message.find({ chatId: id })
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedMessages = messages
      .reverse()
      .map(
        (msg: {
          senderId: { toString: () => string };
          originalText: string;
          translatedText?: string;
        }) => {
          // We need to compare IDs carefully. msg.senderId might be an ObjectId or populated object.
          // But we didn't populate messages here, so it's likely an ObjectId.
          // However, we populated chat.participants.
          const senderIdStr = msg.senderId.toString();
          const myIdStr = user?._id?.toString();

          const isMe = !!myIdStr && senderIdStr === myIdStr && isParticipant;

          // If it's me, use original text. If other, use translated text if available, else original.
          const text = isMe
            ? msg.originalText
            : msg.translatedText || msg.originalText;

          return {
            text: text || "", // Ensure text is string
            sender: isMe ? "me" : "other",
          };
        },
      );

    const suggestions = await generateSmartReplies(
      formattedMessages as { text: string; sender: "me" | "other" }[],
      preferredLanguage,
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Smart replies error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}
