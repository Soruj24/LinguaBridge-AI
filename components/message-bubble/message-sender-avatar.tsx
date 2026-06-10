"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageSenderAvatarProps {
  senderId: { name: string; avatar?: string };
  isMe: boolean;
  isSameSender?: boolean;
  lowBandwidth: boolean;
}

export function MessageSenderAvatar({ senderId, isMe, isSameSender }: MessageSenderAvatarProps) {
  if (isMe) {
    return <div className="w-7 shrink-0" />;
  }

  if (isSameSender) {
    return <div className="w-7 shrink-0" />;
  }

  return (
    <div className="w-7 shrink-0 flex flex-col justify-end">
      <Avatar className="h-7 w-7 mb-0.5">
        <AvatarImage src={senderId?.avatar} />
        <AvatarFallback className="text-[10px]">{senderId?.name?.[0]}</AvatarFallback>
      </Avatar>
    </div>
  );
}
