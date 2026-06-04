"use client";

import { Loader2, UserPlus, Clock, CheckCircle, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus: "none" | "friends" | "request_sent" | "request_received";
}

interface AddFriendListProps {
  query: string;
  users: SearchUser[];
  isSearching: boolean;
  sendingIds: Set<string>;
  onSendRequest: (recipientId: string) => void;
}

export function AddFriendList({
  query,
  users,
  isSearching,
  sendingIds,
  onSendRequest,
}: AddFriendListProps) {
  const statusBadge = (user: SearchUser) => {
    switch (user.friendStatus) {
      case "friends":
        return (
          <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium shrink-0">
            <CheckCircle className="h-3 w-3" />
            Friends
          </span>
        );
      case "request_sent":
        return (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium shrink-0">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "request_received":
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
            <UserCheck className="h-3 w-3" />
            Received
          </span>
        );
      default:
        return (
          <Button
            size="sm"
            className="h-7 gap-1 rounded-lg text-xs shrink-0 px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              onSendRequest(user._id);
            }}
            disabled={sendingIds.has(user._id)}
          >
            {sendingIds.has(user._id) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
            Add
          </Button>
        );
    }
  };

  return (
    <ScrollArea className="max-h-[300px] -mx-6 px-6">
      {query.length < 2 ? (
        <p className="text-center text-sm text-muted-foreground/60 py-8">
          Type at least 2 characters to search
        </p>
      ) : isSearching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground/60 py-8">
          No people found matching &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-1 py-2">
          {users.map((user) => (
            <div
              key={user._id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                user.friendStatus === "none" && "hover:bg-muted/50",
              )}
            >
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground/70 truncate">
                  {user.email}
                </p>
              </div>
              {statusBadge(user)}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
