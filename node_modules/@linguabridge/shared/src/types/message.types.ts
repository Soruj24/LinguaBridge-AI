export interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; email: string; avatar?: string };
  receiverId?: { _id: string; name: string; email: string; avatar?: string };
  originalText: string;
  translatedText?: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  isImage?: boolean;
  createdAt: string;
  isOptimistic?: boolean;
  readBy?: string[];
  replyTo?: {
    _id: string;
    originalText: string;
    senderId: { _id: string; name: string };
    fileUrl?: string;
    isImage?: boolean;
  };
  isPinned?: boolean;
  editedAt?: string | null;
  scheduledAt?: string;
  status?: "scheduled" | "sent" | "failed";
}
