"use client";

import { useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, ChatTypingIndicator } from "./message-bubble";
import { cn } from "@/lib/utils";

export interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; email: string; avatar?: string };
  originalText: string;
  translatedText?: string;
  voiceUrl?: string;
  createdAt: string;
  isOptimistic?: boolean;
}

interface MessageListProps {
  messages: Message[];
  typingUsers?: string[];
  currentUserId?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onLoadMore?: () => void;
  className?: string;
}

export function MessageList({
  messages,
  typingUsers = [],
  currentUserId,
  onReact,
  onLoadMore,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const userId = currentUserId || session?.user?.id;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <ScrollArea className={cn("flex-1 p-4", className)}>
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId._id === userId;
          const showAvatar =
            index === 0 ||
            messages[index - 1].senderId._id !== message.senderId._id;

          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onReact={onReact}
            />
          );
        })}

        {typingUsers.length > 0 && (
          <ChatTypingIndicator
            name={typingUsers.length === 1 ? typingUsers[0] : undefined}
          />
        )}
      </div>
    </ScrollArea>
  );
}