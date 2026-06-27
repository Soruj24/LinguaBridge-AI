export interface SocketMessage {
  chatId: string;
  text: string;
  senderId: string | { _id: string };
  receiverId: string | { _id: string };
  replyToId?: string;
  _id?: string;
}

export interface ProcessedMessage {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; email: string; avatar?: string };
  receiverId: { _id: string; name: string; email: string; avatar?: string };
  originalText: string;
  translatedText?: string;
  languageFrom: string;
  languageTo: string;
  phoneticText?: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  isImage?: boolean;
  replyTo?: {
    _id: string;
    originalText: string;
    senderId: { _id: string; name: string };
  };
  isDeleted?: boolean;
  editedAt?: Date;
  isPinned?: boolean;
  scheduledAt?: Date;
  status?: "scheduled" | "sent" | "failed";
  createdAt: Date;
  updatedAt: Date;
}
