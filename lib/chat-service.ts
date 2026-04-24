import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { processTranslationPipeline } from "@/lib/ai";

export async function processMessage({
  senderId,
  receiverId,
  text,
  chatId,
  voiceUrl,
  translatedText: providedTranslatedText,
  translatedVoiceUrl: providedTranslatedVoiceUrl,
  fileUrl,
  fileType,
  fileSize,
  isImage,
}: {
  senderId: string;
  receiverId: string;
  text: string;
  chatId: string;
  voiceUrl?: string;
  translatedText?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  isImage?: boolean;
}) {
  await connectDB();

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new Error("Receiver not found");

  const sender = await User.findById(senderId);
  if (!sender) throw new Error("Sender not found");
  if (sender.isActive === false) throw new Error("Sender is inactive");

  let translatedText = providedTranslatedText;
  let detectedLang = "en";
  let phonetic = "";

  if (voiceUrl || fileUrl) {
    translatedText = providedTranslatedText;
  } else {
    const result = await processTranslationPipeline(text, receiver.preferredLanguage);
    detectedLang = result.detectedLanguage;
    translatedText = providedTranslatedText || result.translated;
    phonetic = result.phonetic;
  }

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
    translatedVoiceUrl: providedTranslatedVoiceUrl,
    fileUrl,
    fileType,
    fileSize,
    isImage,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  return await Message.findById(message._id)
    .populate("senderId", "name email avatar")
    .populate("receiverId", "name email avatar");
}
