import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { translateText, detectLanguage } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, senderLanguage, receiverLanguage } = await req.json();

    if (!message || !receiverLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: message and receiverLanguage" },
        { status: 400 }
      );
    }

    let detectedLanguage = senderLanguage;
    
    // Automatically detect language if not provided
    if (!detectedLanguage) {
      detectedLanguage = await detectLanguage(message);
    }

    // Translate the text
    // Optimization: If detected language matches receiver language, we might skip translation,
    // but usually users expect a "translatedText" field even if it's the same.
    // However, the AI translation might improve grammar or style even if languages match, 
    // but typically we skip or just return the same if identical. 
    // Let's rely on translateText or just call it. 
    // The translateText function prompt says: "If the text is already in the target language, return it as is."
    // So it is safe to call it.
    
    const translatedText = await translateText(message, receiverLanguage);

    return NextResponse.json({
      originalText: message,
      translatedText,
      detectedLanguage,
    });
  } catch (error) {
    console.error("Error translating text:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
