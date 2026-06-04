"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck, Loader2, Clock, UserX } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface ProfileActionsProps {
  userId: string;
  initialFriendStatus: "none" | "friends" | "request_sent" | "request_received";
  isOwnProfile: boolean;
  friendshipId?: string | null;
}

export function ProfileActions({ userId, initialFriendStatus, isOwnProfile, friendshipId }: ProfileActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialFriendStatus);
  const [isLoading, setIsLoading] = useState(false);

  if (isOwnProfile) return null;

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

  if (status === "friends") {
    return (
      <div className="flex gap-2 w-full">
        <Button
          className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
          onClick={handleStartChat}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          Send Message
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
          onClick={handleUnfriend}
          disabled={isLoading}
          title="Remove friend"
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (status === "request_sent") {
    return (
      <Button
        className="flex-1 gap-2 rounded-xl h-11"
        variant="outline"
        disabled
      >
        <Clock className="h-4 w-4" />
        Request Pending
      </Button>
    );
  }

  if (status === "request_received") {
    return (
      <Button
        className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/20"
        onClick={handleAcceptRequest}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        Accept Request
      </Button>
    );
  }

  return (
    <Button
      className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
      onClick={handleSendRequest}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      Add Friend
    </Button>
  );
}
