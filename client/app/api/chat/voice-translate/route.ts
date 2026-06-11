import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { translateVoice } from "@/lib/ai";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, targetLanguage, voice } = await req.json();

    if (!messageId || !targetLanguage) {
      return NextResponse.json(
        { error: "Message ID and target language required" },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const translatedText = message.translatedText || message.originalText;
    if (!translatedText) {
      return NextResponse.json(
        { error: "No text to translate" },
        { status: 400 }
      );
    }

    const voiceBuffer = await translateVoice(translatedText, targetLanguage, voice || "alloy");

    const fileName = `voice-translated-${messageId}-${targetLanguage}.mp3`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, voiceBuffer);

    const voiceUrl = `/uploads/${fileName}`;

    await Message.findByIdAndUpdate(messageId, {
      translatedVoiceUrl: voiceUrl,
    });

    return NextResponse.json({ voiceUrl });
  } catch (error) {
    console.error("Voice translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate voice" },
      { status: 500 }
    );
  }
}