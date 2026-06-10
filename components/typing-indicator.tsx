"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator({ userName }: { userName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-1.5 p-3 bg-muted/50 rounded-2xl w-fit">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground animate-pulse font-medium">
          {userName}
        </span>
      )}
    </div>
  );
}
