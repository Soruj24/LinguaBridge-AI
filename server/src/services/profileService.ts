import connectDB from "../config/connectDB";
import { ChatUser, UserStatus, Chat, ChatMessage, Friendship, Block } from "../models/chat";

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferredLanguage?: string;
  isOnline?: boolean;
  lastSeen?: string;
  showLastSeen?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileData {
  user: ProfileUser;
  isOwnProfile: boolean;
  friendStatus: "none" | "friends" | "request_sent" | "request_received";
  friendshipId: string | null;
  chatCount: number;
  messageCount: number;
  hasBlocked: boolean;
  blockId: string | null;
}

export async function getProfileData(
  userId: string,
  currentUserEmail?: string | null,
): Promise<ProfileData> {
  await connectDB();

  const user = await ChatUser.findById(userId).select("-password").lean();
  if (!user) throw new Error("User not found");

  const userStatus = await UserStatus.findOne({ userId }).lean();

  let friendStatus: ProfileData["friendStatus"] = "none";
  let friendshipId: string | null = null;
  let hasBlocked = false;
  let blockId: string | null = null;

  if (currentUserEmail) {
    const currentUser = await ChatUser.findOne({ email: currentUserEmail });
    if (currentUser) {
      const isOwnProfile = currentUser._id.toString() === userId;
      if (!isOwnProfile) {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: currentUser._id, recipient: userId },
            { requester: userId, recipient: currentUser._id },
          ],
        });
        if (friendship) {
          friendshipId = friendship._id.toString();
          if (friendship.status === "accepted") {
            friendStatus = "friends";
          } else if (friendship.status === "pending") {
            friendStatus =
              friendship.requester.toString() === currentUser._id.toString()
                ? "request_sent"
                : "request_received";
          }
        }

        const block = await Block.findOne({
          blocker: currentUser._id,
          blocked: userId,
        });
        if (block) {
          hasBlocked = true;
          blockId = block._id.toString();
        }
      }
    }
  }

  const chatCount = await Chat.countDocuments({ participants: userId });
  const messageCount = await ChatMessage.countDocuments({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  const isOwnProfile = currentUserEmail
    ? (
        await ChatUser.findOne({ email: currentUserEmail })
      )?._id.toString() === userId
    : false;

  const userWithStatus = {
    ...(user as unknown as ProfileUser),
    isOnline: userStatus?.isOnline ?? false,
    lastSeen: userStatus?.lastSeen?.toISOString?.() ?? userStatus?.lastSeen ?? null,
    showLastSeen: (user as Record<string, unknown>)?.showLastSeen as boolean ?? true,
  };

  return {
    user: userWithStatus,
    isOwnProfile,
    friendStatus,
    friendshipId,
    chatCount,
    messageCount,
    hasBlocked,
    blockId,
  };
}
