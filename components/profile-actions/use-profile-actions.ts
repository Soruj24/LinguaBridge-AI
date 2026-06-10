"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import axios from "axios";
import { toast } from "sonner";

type FriendStatus = "none" | "friends" | "request_sent" | "request_received";

interface BlockedUserItem {
  _id: string;
  blocked: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
    preferredLanguage?: string;
  };
  createdAt: string;
}

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
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/friends/request", { recipientId: userId });
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
      const res = await axios.get("/api/friends/requests");
      const incoming = res.data.incoming ?? [];
      const match = incoming.find(
        (r: { user: { _id: string } }) => r.user._id === userId,
      );
      if (match) {
        await axios.patch(`/api/friends/${match._id}`, { action: "accept" });
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
      const res = await axios.post("/api/chat", { receiverId: userId });
      router.push(`/chat/${res.data._id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
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
      await axios.delete(`/api/friends/${friendshipId}`);
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
      await axios.post("/api/block", { blockedUserId: userId });
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
      await axios.delete(`/api/block/${blockId}`);
      setHasBlocked(false);
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    } finally {
      setBlockLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await axios.get("/api/block/blocked-users");
      setBlockedUsers(res.data ?? []);
    } catch {
      toast.error("Failed to load blocked users");
    }
  };

  const handleUnblockByUserId = async (targetUserId: string) => {
    const block = blockedUsers.find((b) => b.blocked._id === targetUserId);
    if (!block) {
      toast.error("Block record not found");
      return;
    }
    setBlockLoading(true);
    try {
      await axios.delete(`/api/block/${block._id}`);
      setHasBlocked(false);
      setBlockedUsers((prev) => prev.filter((b) => b._id !== block._id));
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
      await axios.post("/api/report", {
        reportedUserId: userId,
        reason,
        description,
      });
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
    blockedUsers,
    handleSendRequest,
    handleAcceptRequest,
    handleStartChat,
    handleUnfriend,
    handleBlock,
    handleUnblock,
    handleUnblockByUserId,
    handleReport,
    fetchBlockedUsers,
  };
}
