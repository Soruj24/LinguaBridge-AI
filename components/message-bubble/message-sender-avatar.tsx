"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageSenderAvatarProps {
  senderId: { name: string; avatar?: string };
  isMe: boolean;
  isSameSender?: boolean;
  lowBandwidth: boolean;
}

export function MessageSenderAvatar({ senderId, isMe, isSameSender, lowBandwidth }: MessageSenderAvatarProps) {
  if (isMe) {
    return (
      <Avatar className="h-8 w-8 mb-0.5 shrink-0 opacity-0 w-0 hidden sm:block">
        <AvatarImage src={senderId?.avatar} />
        <AvatarFallback>{senderId?.name?.[0]}</AvatarFallback>
      </Avatar>
    );
  }

  if (!lowBandwidth) {
    return (
      <div className="w-8 shrink-0 flex flex-col justify-end">
        {!isSameSender && (
          <Avatar className="h-8 w-8 mb-0.5">
            <AvatarImage src={senderId?.avatar} />
            <AvatarFallback className="bg-muted text-xs">{senderId?.name?.[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  if (!isSameSender) {
    return (
      <div className="w-8 shrink-0 flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground w-8 h-8 flex items-center justify-center bg-muted rounded-full">
          {senderId?.name?.[0]}
        </span>
      </div>
    );
  }

  return <div className="w-8 shrink-0" />;
}
