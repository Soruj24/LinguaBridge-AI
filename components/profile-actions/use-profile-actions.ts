"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import axios from "axios";
import { toast } from "sonner";

type FriendStatus = "none" | "friends" | "request_sent" | "request_received";

export function useProfileActions(userId: string, initialStatus: FriendStatus, friendshipId?: string | null) {
  const router = useRouter();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

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
      const match = incoming.find((r: { user: { _id: string } }) => r.user._id === userId);
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

  return {
    status,
    isLoading,
    handleSendRequest,
    handleAcceptRequest,
    handleStartChat,
    handleUnfriend,
  };
}
