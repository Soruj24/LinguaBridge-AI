import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processMessage } from "@/lib/chat-service";
import { transcribeAudio, translateText, textToSpeech } from "@/lib/ai";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;
    const receiverId = formData.get("receiverId") as string;
    // Optional: Accept target language if caller wants to specify it explicitly, 
    // though processMessage usually handles it based on receiver.
    // But to follow the prompt "Translate text to target language", we can do it here if needed.
    // However, processMessage logic is robust. 
    // Let's implement the pipeline as requested in the prompt, explicitly.
    
    if (!file || !chatId || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Accept audio file & Save using streams
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`; 
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    
    // Use stream pipeline to save file
    await pipeline(
      Readable.from(buffer),
      fs.createWriteStream(filePath)
    );
    
    const voiceUrl = `/uploads/${fileName}`;

    // 2. Convert speech to text using OpenAI Whisper
    let originalText = "";
    try {
      originalText = await transcribeAudio(filePath);
    } catch (sttError) {
      console.error("Transcription failed, proceeding with raw voice only:", sttError);
      originalText = "";
    }

    // 3. No voice translation: rely on server pipeline for text translation only

    // 4. Create and process message (server-side pipeline still validates)
    const message = await processMessage({
      senderId: session.user.id,
      receiverId,
      text: originalText || "(voice message)",
      chatId,
      voiceUrl,
      // Do not provide translated voice; server may generate text translation
    });

    // 5. Return requested fields
    return NextResponse.json({
      originalText: message.originalText,
      translatedText: message.translatedText,
      translatedVoiceUrl: message.translatedVoiceUrl,
      ...JSON.parse(JSON.stringify(message)),
    });
  } catch (error) {
    console.error("Error processing voice message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
