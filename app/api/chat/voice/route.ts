import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processMessage } from "@/lib/chat-service";
import { transcribeAudio, translateText, textToSpeech } from "@/lib/ai";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

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
    const originalText = await transcribeAudio(filePath);

    // 3. Translate text to target language using GPT-4o-mini
    // We need the receiver's language. 
    // To keep this route efficient, we can let processMessage handle it, 
    // OR we can fetch user here. 
    // But the prompt asks for "Step 3: Translate... Step 4: Convert... Step 5: Return".
    // If I let processMessage do it, it's hidden. 
    // I will let processMessage do it because it already has the logic to check user language.
    // AND processMessage returns the message object which contains originalText, translatedText, translatedVoiceUrl.
    
    // However, the prompt says "Return: originalText, translatedText, translatedVoiceUrl".
    // I will make sure the response contains these.
    
    const message = await processMessage({
      senderId: session.user.id,
      receiverId,
      text: originalText,
      chatId,
      voiceUrl,
    });

    // 5. Return requested fields
    return NextResponse.json({
      originalText: message.originalText,
      translatedText: message.translatedText,
      translatedVoiceUrl: message.translatedVoiceUrl,
      // Include full message for UI updates
      ...JSON.parse(JSON.stringify(message))
    });
  } catch (error) {
    console.error("Error processing voice message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
