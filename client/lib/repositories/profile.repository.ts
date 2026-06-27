const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

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
