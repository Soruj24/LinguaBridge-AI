import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { processTranslationPipeline } from "@/lib/ai";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

export async function processMessage({
  senderId,
  receiverId,
  text,
  chatId,
  voiceUrl,
  translatedText: providedTranslatedText,
  translatedVoiceUrl: providedTranslatedVoiceUrl,
}: {
  senderId: string;
  receiverId: string;
  text: string;
  chatId: string;
  voiceUrl?: string;
  translatedText?: string;
  translatedVoiceUrl?: string;
}) {
  await connectDB();

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new Error("Receiver not found");

  const sender = await User.findById(senderId);
  if (!sender) throw new Error("Sender not found");
  if (sender.isActive === false) throw new Error("Sender is inactive");

  // Use the translation pipeline for detection and translation in one go
  console.log(`Processing message: "${text}" for receiver ${receiver.name} (${receiver.preferredLanguage})`);
  const { detectedLanguage: detectedLang, translated, phonetic } =
    await processTranslationPipeline(text, receiver.preferredLanguage);
  console.log(`Translation result: ${translated} (detected: ${detectedLang})`);

  // Use provided translation if available, otherwise use pipeline result
  const translatedText = providedTranslatedText || translated;
  const translatedVoiceUrl = providedTranslatedVoiceUrl;

  const message = await Message.create({
    chatId,
    senderId,
    receiverId,
    originalText: text,
    translatedText,
    phoneticText: phonetic,
    languageFrom: detectedLang,
    languageTo: receiver.preferredLanguage,
    voiceUrl,
    translatedVoiceUrl,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  // Return populated message
  return await Message.findById(message._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");
}
