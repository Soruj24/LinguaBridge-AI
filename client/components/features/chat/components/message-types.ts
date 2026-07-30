export interface Reaction {
  emoji: string;
  userId: string;
}

export interface MessageBubbleMessage {
  _id: string;
  originalText: string;
  translatedText?: string;
  voiceUrl?: string;
  translatedVoiceUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  isImage?: boolean;
  createdAt: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiverId?: {
    _id: string;
  };
  reactions?: Reaction[];
  languageFrom?: string;
  languageTo?: string;
  phoneticText?: string;
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

export interface MessageBubbleProps {
  message: MessageBubbleMessage;
  isMe: boolean;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isSameSender?: boolean;
  onReply?: (message: MessageBubbleMessage) => void;
  onEdit?: (id: string, newText: string) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  onForward?: (message: MessageBubbleMessage) => void;
}
