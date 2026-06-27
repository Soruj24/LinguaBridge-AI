import api from "@/lib/api";

export async function sendFriendRequest(recipientId: string) {
  const { data } = await api.post("/api/friends/request", { recipientId });
  return data;
}

export async function getFriendRequests() {
  const { data } = await api.get("/api/friends/requests");
  return data;
}

export async function respondToFriendRequest(
  friendshipId: string,
  action: "accept" | "decline",
) {
  const { data } = await api.patch(`/api/friends/${friendshipId}`, { action });
  return data;
}

export async function startChat(receiverId: string) {
  const { data } = await api.post("/api/chat", { receiverId });
  return data;
}

export async function unfriend(friendshipId: string) {
  const { data } = await api.delete(`/api/friends/${friendshipId}`);
  return data;
}

export async function blockUser(blockedUserId: string) {
  const { data } = await api.post("/api/friends/block", { blockedUserId });
  return data;
}

export async function unblockUser(blockId: string) {
  const { data } = await api.delete(`/api/friends/block/${blockId}`);
  return data;
}

export async function reportUser(
  reportedUserId: string,
  reason: string,
  description: string,
) {
  const { data } = await api.post("/api/report", {
    reportedUserId,
    reason,
    description,
  });
  return data;
}
