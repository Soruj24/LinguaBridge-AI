"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck, Loader2, Clock, UserX } from "lucide-react";
import { useProfileActions } from "./use-profile-actions";

interface ProfileActionsProps {
  userId: string;
  initialFriendStatus: "none" | "friends" | "request_sent" | "request_received";
  isOwnProfile: boolean;
  friendshipId?: string | null;
}

export function ProfileActions({ userId, initialFriendStatus, isOwnProfile, friendshipId }: ProfileActionsProps) {
  const {
    status, isLoading,
    handleSendRequest, handleAcceptRequest, handleStartChat, handleUnfriend,
  } = useProfileActions(userId, initialFriendStatus, friendshipId);

  if (isOwnProfile) return null;

  if (status === "friends") {
    return (
      <div className="flex gap-2 w-full">
        <Button
          className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
          onClick={handleStartChat}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
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
      <Button className="flex-1 gap-2 rounded-xl h-11" variant="outline" disabled>
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
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
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
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Add Friend
    </Button>
  );
}
