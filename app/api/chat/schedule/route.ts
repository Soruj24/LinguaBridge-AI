import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { processTranslationPipeline } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, text, scheduledAt } = await req.json();

    if (!chatId || !text || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, text, scheduledAt" },
        { status: 400 }
      );
    }

    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledAt date" },
        { status: 400 }
      );
    }

    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: "scheduledAt must be in the future" },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await Chat.findById(chatId).populate(
      "participants",
      "name email avatar preferredLanguage"
    );
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const receiver = chat.participants.find(
      (p: { email: string }) => p.email !== session.user?.email
    );
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    let translatedText: string | undefined;
    let detectedLang = "en";
    let phonetic = "";

    const result = await processTranslationPipeline(text, receiver.preferredLanguage);
    detectedLang = result.detectedLanguage;
    translatedText = result.translated;
    phonetic = result.phonetic;

    const message = await Message.create({
      chatId,
      senderId: session.user.id,
      receiverId: receiver._id,
      originalText: text,
      translatedText,
      phoneticText: phonetic,
      languageFrom: detectedLang,
      languageTo: receiver.preferredLanguage,
      scheduledAt: scheduleDate,
      status: "scheduled",
      createdAt: scheduleDate,
    });

    const populated = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("receiverId", "name email avatar");

    return NextResponse.json(populated);
  } catch (error) {
    console.error("Error scheduling message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
