import { serverFetch } from "./server-fetch";

export interface FriendStatusResponse {
  data: {
    friendship?: { _id: string; status: string } | null;
    isOwnProfile: boolean;
    hasBlocked: boolean;
    blockId?: string | null;
  };
}

export interface ChatListResponse {
  total?: number;
  chats?: unknown[];
}

export interface MessageSearchResponse {
  total?: number;
  data?: unknown[];
}

export async function fetchFriendStatus(userId: string, viewerId: string): Promise<FriendStatusResponse> {
  return serverFetch(`/api/friends/status/${userId}/${viewerId}`);
}

export async function fetchChatList(): Promise<ChatListResponse> {
  return serverFetch("/api/chat?paginate=true&page=1&limit=100");
}

export async function fetchMessageCount(userId: string): Promise<MessageSearchResponse> {
  return serverFetch(`/api/messages/search/${userId}?q=`);
}
