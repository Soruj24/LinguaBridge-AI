import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processMessage } from "@/lib/chat-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, receiverId, text, voiceUrl } = await req.json();

    if (!text || !receiverId || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await processMessage({
      senderId: session.user.id,
      receiverId,
      text,
      chatId,
      voiceUrl,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
