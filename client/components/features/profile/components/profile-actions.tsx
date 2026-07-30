"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  UserPlus,
  UserCheck,
  Loader2,
  Clock,
  UserX,
  Ban,
  Flag,
} from "lucide-react";
import { useProfileActions } from "./use-profile-actions";
import { BlockConfirmDialog } from "./block-confirm-dialog";
import { ReportDialog } from "./report-dialog";

interface ProfileActionsProps {
  userId: string;
  initialFriendStatus: "none" | "friends" | "request_sent" | "request_received";
  isOwnProfile: boolean;
  friendshipId?: string | null;
  isBlocked?: boolean;
  blockId?: string | null;
  username?: string;
}

export function ProfileActions({
  userId,
  initialFriendStatus,
  isOwnProfile,
  friendshipId,
  isBlocked: initialIsBlocked = false,
  blockId: initialBlockId = null,
  username = "this user",
}: ProfileActionsProps) {
  const {
    status, isLoading, hasBlocked, blockLoading, reportLoading,
    handleSendRequest, handleAcceptRequest, handleStartChat, handleUnfriend,
    handleBlock, handleUnblock, handleReport,
  } = useProfileActions(userId, initialFriendStatus, friendshipId);

  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const effectiveBlocked = hasBlocked || initialIsBlocked;
  const effectiveBlockId = initialBlockId;

  if (isOwnProfile) return null;

  if (effectiveBlocked) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button className="flex-1 gap-2 rounded-xl h-11" variant="outline" disabled>
          <Ban className="h-4 w-4" />
          Blocked
        </Button>
        {effectiveBlockId && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => handleUnblock(effectiveBlockId)}
            disabled={blockLoading}
          >
            {blockLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : null}
            Unblock
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 w-full">
        {status === "friends" ? (
          <>
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
          </>
        ) : status === "request_sent" ? (
          <Button className="flex-1 gap-2 rounded-xl h-11" variant="outline" disabled>
            <Clock className="h-4 w-4" />
            Request Pending
          </Button>
        ) : status === "request_received" ? (
          <Button
            className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/20"
            onClick={handleAcceptRequest}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            Accept Request
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
            onClick={handleSendRequest}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add Friend
          </Button>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 rounded-xl h-9 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setShowBlockDialog(true)}
        >
          <Ban className="h-4 w-4" />
          Block
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 rounded-xl h-9 text-muted-foreground"
          onClick={() => setShowReportDialog(true)}
        >
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>

      <BlockConfirmDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        username={username}
        onConfirm={() => {
          handleBlock();
          setShowBlockDialog(false);
        }}
        isLoading={blockLoading}
      />

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        username={username}
        onSubmit={handleReport}
        isLoading={reportLoading}
      />
    </div>
  );
}
