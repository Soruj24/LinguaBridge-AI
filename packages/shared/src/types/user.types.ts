export type FriendStatus = "none" | "friends" | "request_sent" | "request_received";

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage: string;
}

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  preferredLanguage: string;
  bio: string;
  createdAt: string | null;
  updatedAt: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  showLastSeen: boolean;
}

export interface ProfileData {
  user: ProfileUser;
  isOwnProfile: boolean;
  friendStatus: FriendStatus;
  friendshipId: string | null;
  chatCount: number;
  messageCount: number;
  hasBlocked: boolean;
  blockId: string | null;
}

export interface Friend {
  friendshipId: string;
  user: UserSummary;
  since: string;
}

export interface PendingRequest {
  _id: string;
  user: UserSummary;
  createdAt: string;
}

export interface ChatItem {
  _id: string;
  participants: { _id: string }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  markedUnreadBy?: string[];
  updatedAt: string;
  folderId?: string | null;
  isArchived?: boolean;
  archivedAt?: string | null;
}

export interface SocialUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface SocialLoginBody {
  provider: "google" | "github" | "facebook";
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
}
