"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { toast } from "sonner";
import {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  startChat,
  unfriend,
  blockUser,
  unblockUser,
  reportUser,
} from "@/lib/repositories/friend-actions.repository";
import type { FriendStatus } from "@/types/profile";

export function useProfileActions(
  userId: string,
  initialStatus: FriendStatus,
  friendshipId?: string | null,
) {
  const router = useRouter();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      await sendFriendRequest(userId);
      setStatus("request_sent");
      toast.success("Friend request sent");
    } catch {
      toast.error("Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      const data = await getFriendRequests();
      const incoming = data.incoming ?? [];
      const match = incoming.find(
        (r: { user: { _id: string } }) => r.user._id === userId,
      );
      if (match) {
        await respondToFriendRequest(match._id, "accept");
        setStatus("friends");
        toast.success("Friend request accepted");
      }
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    setIsLoading(true);
    try {
      const data = await startChat(userId);
      router.push(`/chat/${data._id}`);
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403) {
        toast.error("You must be friends to message this user");
      } else {
        toast.error("Failed to start chat");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!friendshipId) return;
    setIsLoading(true);
    try {
      await unfriend(friendshipId);
      setStatus("none");
      toast.success("Friend removed");
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    try {
      await blockUser(userId);
      setHasBlocked(true);
      setStatus("none");
      toast.success("User blocked");
    } catch {
      toast.error("Failed to block user");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    setBlockLoading(true);
    try {
      await unblockUser(blockId);
      setHasBlocked(false);
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleReport = async (
    reason: string,
    description: string,
  ): Promise<void> => {
    setReportLoading(true);
    try {
      await reportUser(userId, reason, description);
      toast.success("Report submitted. Thank you.");
    } catch {
      toast.error("Failed to submit report");
      throw new Error("Failed to submit report");
    } finally {
      setReportLoading(false);
    }
  };

  return {
    status,
    isLoading,
    hasBlocked,
    blockLoading,
    reportLoading,
    handleSendRequest,
    handleAcceptRequest,
    handleStartChat,
    handleUnfriend,
    handleBlock,
    handleUnblock,
    handleReport,
  };
}
