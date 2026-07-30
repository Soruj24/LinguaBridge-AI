"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface MessageReactionsDisplayProps {
  groupedReactions: Record<string, number>;
  isMe: boolean;
  onReact: (emoji: string) => void;
}

export function MessageReactionsDisplay({ groupedReactions, isMe, onReact }: MessageReactionsDisplayProps) {
  if (Object.keys(groupedReactions).length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1 z-10", isMe ? "justify-end mr-1" : "justify-start ml-1")}>
      {Object.entries(groupedReactions).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="secondary"
          size="sm"
          className="h-5 px-1.5 text-[10px] rounded-full bg-background border shadow-sm hover:bg-muted"
          onClick={() => onReact(emoji)}
        >
          {emoji} <span className="ml-1">{count}</span>
        </Button>
      ))}
    </div>
  );
}
