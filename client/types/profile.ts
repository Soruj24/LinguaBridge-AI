export type FriendStatus = "none" | "friends" | "request_sent" | "request_received";

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
