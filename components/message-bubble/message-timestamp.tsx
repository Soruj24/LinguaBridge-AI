"use client";

import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface MessageTimestampProps {
  createdAt: string;
  isMe: boolean;
}

export function MessageTimestamp({ createdAt, isMe }: MessageTimestampProps) {
  const { data: session } = useSession();

  return (
    <div className={cn("flex justify-end px-1 mt-1 opacity-70", isMe ? "text-primary/70 dark:text-primary-foreground/70" : "text-muted-foreground")}>
      <span className="text-[10px] font-medium">
        {new Date(createdAt).toLocaleTimeString(session?.user?.preferredLanguage || [], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
