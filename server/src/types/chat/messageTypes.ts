import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId?: Types.ObjectId;
  originalText: string;
  translatedText?: string;
  languageFrom: string;
  languageTo: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  isImage: boolean;
  phoneticText?: string;
  reactions: Array<{
    emoji: string;
    userId: Types.ObjectId;
  }>;
  readBy: Types.ObjectId[];
  replyTo?: Types.ObjectId;
  isDeleted: boolean;
  editedAt?: Date;
  isPinned: boolean;
  scheduledAt?: Date;
  status: "scheduled" | "sent" | "failed";
  createdAt: Date;
  updatedAt: Date;
}
