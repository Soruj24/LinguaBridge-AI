import { Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  type: 'text' | 'voice';
  messageType: 'text' | 'image' | 'voice' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  conversation: Types.ObjectId;
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: Types.ObjectId | null;
  reactions: Array<{
    user: Types.ObjectId;
    emoji: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  _id: Types.ObjectId;
  type: 'private' | 'group';
  participants: Types.ObjectId[];
  name?: string;
  description?: string;
  avatar?: string;
  admin?: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt: Date;
  unreadCount: Map<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
