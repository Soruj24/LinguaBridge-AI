"use client";

import { useSession } from "next-auth/react";
import { cn } from "@/utils";

interface MessageTimestampProps {
  createdAt: string;
  editedAt?: string | null;
  isMe: boolean;
  readBy?: string[];
  status?: "scheduled" | "sent" | "failed";
}

export function MessageTimestamp({ createdAt, editedAt, isMe, readBy, status }: MessageTimestampProps) {
  const { data: session } = useSession();
  const isSeen = isMe && readBy && readBy.length > 0;

  return (
    <div className={cn("flex items-center gap-1 justify-end px-1 mt-1 opacity-70", isMe ? "text-primary/70 dark:text-primary-foreground/70" : "text-muted-foreground")}>
      {editedAt && (
        <span className="text-[10px] italic opacity-60">(edited)</span>
      )}
      <span className="text-[10px] font-medium">
        {status === "scheduled" ? "Scheduled" : isSeen ? "Seen" : isMe ? "Sent" : null}
      </span>
      <span className="text-[10px] font-medium">
        {new Date(createdAt).toLocaleTimeString(session?.user?.preferredLanguage || [], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
