import {
  fetchFriendStatus,
  fetchChatList,
  fetchMessageCount,
} from "@/lib/repositories/profile.repository";
import type { ProfileData, FriendStatus } from "@/types/shared";

export async function getProfileData(
  userId: string,
  viewerEmail?: string,
): Promise<ProfileData> {
  const [friendStatusRes, chatRes, messageRes] = await Promise.all([
    fetchFriendStatus(userId, userId).catch(() => null),
    fetchChatList().catch(() => null),
    fetchMessageCount(userId).catch(() => null),
  ]);

  const friendship = friendStatusRes?.data?.friendship ?? null;
  const friendStatus: FriendStatus = friendship
    ? (friendship.status as FriendStatus)
    : "none";

  return {
    user: {
      _id: userId,
      name: "User",
      email: "",
      avatar: "",
      preferredLanguage: "en",
      bio: "",
      createdAt: null,
      updatedAt: null,
      isOnline: false,
      lastSeen: null,
      showLastSeen: true,
    },
    isOwnProfile: friendStatusRes?.data?.isOwnProfile ?? false,
    friendStatus,
    friendshipId: friendship?._id ?? null,
    chatCount:
      chatRes?.total ?? (chatRes?.chats as unknown[])?.length ?? 0,
    messageCount:
      messageRes?.total ?? (messageRes?.data as unknown[])?.length ?? 0,
    hasBlocked: friendStatusRes?.data?.hasBlocked ?? false,
    blockId: friendStatusRes?.data?.blockId ?? null,
  };
}
