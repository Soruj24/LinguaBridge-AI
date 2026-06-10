"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ban, Loader2 } from "lucide-react";

interface BlockedUser {
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

interface BlockedUsersListProps {
  blockedUsers: BlockedUser[];
  onUnblock: (userId: string) => void;
  isLoading?: boolean;
}

export function BlockedUsersList({
  blockedUsers,
  onUnblock,
  isLoading,
}: BlockedUsersListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Ban className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">You haven&apos;t blocked anyone</p>
        <p className="text-sm">Blocked users will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blockedUsers.map((item) => (
        <Card key={item._id} className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.blocked.avatar || undefined} />
              <AvatarFallback>
                {item.blocked.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {item.blocked.name}
              </p>
              {item.blocked.bio && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.blocked.bio}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnblock(item.blocked._id)}
              className="shrink-0"
            >
              Unblock
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
