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
    name: string;
    avatar?: string;
  };
  reactions?: Reaction[];
  languageFrom?: string;
  languageTo?: string;
  phoneticText?: string;
}

export interface MessageBubbleProps {
  message: MessageBubbleMessage;
  isMe: boolean;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isSameSender?: boolean;
}
