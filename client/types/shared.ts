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
  readBy?: string[];
  replyTo?: { _id: string; originalText: string; senderId: { _id: string; name: string }; fileUrl?: string; isImage?: boolean };
  isPinned?: boolean;
  editedAt?: string | null;
  scheduledAt?: string;
  status?: "scheduled" | "sent" | "failed";
  languageFrom?: string;
  languageTo?: string;
  phoneticText?: string;
  reactions?: { emoji: string; userId: string }[];
  isOptimistic?: boolean;
}

export interface Chat {
  _id: string;
  participants: { _id: string; name: string; email: string; avatar?: string; preferredLanguage: string }[];
  alwaysTranslate: boolean;
  autoTranslateLanguage: string | null;
  markedUnreadBy: string[];
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatItem {
  _id: string;
  participants: { _id: string; name: string; email: string; avatar?: string; preferredLanguage: string }[];
  lastMessage?: { _id: string; originalText: string; createdAt: string };
  unreadCount?: number;
  folderId?: string | null;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  friendshipId: string;
  user: { _id: string; name: string; avatar?: string };
}

export interface PendingRequest {
  _id: string;
  user: { _id: string; name: string; avatar?: string; email: string };
}

export interface Folder {
  _id: string;
  userId: string;
  name: string;
  color: string;
  order: number;
  chatIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginActivity {
  _id: string;
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string;
  os?: string;
  location?: { country?: string; city?: string; region?: string };
  type: "login" | "logout" | "signup" | "password_change" | "2fa_enabled" | "2fa_disabled";
  success: boolean;
  failureReason?: string;
  provider?: "credentials" | "google" | "github" | "apple";
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

export interface ProfileData {
  user: { _id: string; name: string; email: string; avatar: string; preferredLanguage: string; bio: string; createdAt: null; updatedAt: null; isOnline: boolean; lastSeen: null; showLastSeen: boolean };
  isOwnProfile: boolean;
  friendStatus: FriendStatus;
  friendshipId: string | null;
  chatCount: number;
  messageCount: number;
  hasBlocked: boolean;
  blockId: string | null;
}

export type FriendStatus = "none" | "request_sent" | "request_received" | "friends";

export interface PhrasebookEntry {
  _id: string;
  userId: string;
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  sourceMessageId?: string;
  sourceChatId?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
