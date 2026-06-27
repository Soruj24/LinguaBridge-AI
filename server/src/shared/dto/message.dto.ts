export interface MessageDTO {
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

export function toMessageDTO(message: any): MessageDTO {
  return {
    _id: message._id?.toString(),
    chatId: message.chatId?.toString?.() || message.chatId,
    senderId: {
      _id: message.senderId?._id?.toString?.() || message.senderId?._id || message.senderId,
      name: message.senderId?.name || "",
      email: message.senderId?.email || "",
      avatar: message.senderId?.avatar || message.senderId?.image,
    },
    receiverId: message.receiverId
      ? {
          _id: message.receiverId?._id?.toString?.() || message.receiverId?._id || message.receiverId,
          name: message.receiverId?.name || "",
          email: message.receiverId?.email || "",
          avatar: message.receiverId?.avatar || message.receiverId?.image,
        }
      : undefined,
    originalText: message.originalText,
    translatedText: message.translatedText,
    voiceUrl: message.voiceUrl,
    translatedVoiceUrl: message.translatedVoiceUrl,
    fileUrl: message.fileUrl,
    isImage: message.isImage,
    createdAt: message.createdAt?.toISOString?.() ?? message.createdAt,
    readBy: (message.readBy || []).map((id: any) => id.toString?.() || id),
    replyTo: message.replyTo
      ? {
          _id: message.replyTo._id?.toString?.() || message.replyTo._id,
          originalText: message.replyTo.originalText,
          senderId: {
            _id: message.replyTo.senderId?._id?.toString?.() || message.replyTo.senderId,
            name: message.replyTo.senderId?.name || "",
          },
          fileUrl: message.replyTo.fileUrl,
          isImage: message.replyTo.isImage,
        }
      : undefined,
    isPinned: message.isPinned ?? false,
    editedAt: message.editedAt?.toISOString?.() ?? message.editedAt ?? null,
    scheduledAt: message.scheduledAt?.toISOString?.() ?? message.scheduledAt,
    status: message.status ?? "sent",
  };
}
