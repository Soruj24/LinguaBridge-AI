"use client";

import { Badge } from "@/components/ui/badge";
import { useUserStatus } from "@/hooks/use-user-status";
import { formatLastSeen } from "@/lib/last-seen";

interface ProfileStatusBadgeProps {
  userId: string;
  initialIsOnline: boolean;
  initialLastSeen: string | null;
  initialShowLastSeen: boolean;
}

export function ProfileStatusBadge({
  userId,
  initialIsOnline,
  initialLastSeen,
  initialShowLastSeen,
}: ProfileStatusBadgeProps) {
  const { targetStatus } = useUserStatus(userId);

  const isOnline = targetStatus?.isOnline ?? initialIsOnline;
  const lastSeen = targetStatus?.lastSeen ?? initialLastSeen;
  const showLastSeen = targetStatus?.showLastSeen ?? initialShowLastSeen;

  const lastSeenText = formatLastSeen(lastSeen, showLastSeen, isOnline);

  if (isOnline) {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Online
      </Badge>
    );
  }

  if (lastSeenText) {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-muted-foreground border-border">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        Last seen {lastSeenText.toLowerCase()}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-muted-foreground border-border">
      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
      Offline
    </Badge>
  );
}
