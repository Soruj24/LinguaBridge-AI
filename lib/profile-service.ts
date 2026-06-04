import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import Friendship from "@/models/Friendship";

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferredLanguage?: string;
  isOnline?: boolean;
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
}

export async function getProfileData(userId: string, currentUserEmail?: string | null): Promise<ProfileData> {
  await connectDB();

  const user = await User.findById(userId).select("-password").lean();
  if (!user) throw new Error("User not found");

  let friendStatus: ProfileData["friendStatus"] = "none";
  let friendshipId: string | null = null;

  if (currentUserEmail) {
    const currentUser = await User.findOne({ email: currentUserEmail });
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
      }
    }
  }

  const chatCount = await Chat.countDocuments({ participants: userId });
  const messageCount = await Message.countDocuments({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  const isOwnProfile = currentUserEmail
    ? (await User.findOne({ email: currentUserEmail }))?._id.toString() === userId
    : false;

  return {
    user: user as unknown as ProfileUser,
    isOwnProfile,
    friendStatus,
    friendshipId,
    chatCount,
    messageCount,
  };
}
