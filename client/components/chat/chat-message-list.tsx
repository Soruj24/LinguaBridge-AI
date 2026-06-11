"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TypingIndicator } from "@/components/typing-indicator";
import { ChevronDown } from "lucide-react";
import type { Message } from "@/types/chat";
import type { MessageBubbleMessage } from "@/components/message-bubble/types";
import { MessageListSkeleton } from "./message-list-skeleton";
import { MessageListEmpty } from "./message-list-empty";
import { MessageItems } from "./message-items";

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentUserId?: string;
  isTyping: boolean;
  typingUser: string | null;
  showScrollButton: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onScrollToBottom: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onReply?: (message: Message) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  onForward?: (message: MessageBubbleMessage) => void;
}

export function ChatMessageList({
  messages, isLoading, hasMore, currentUserId,
  isTyping, typingUser, showScrollButton,
  onScroll, onDelete, onEdit, onScrollToBottom,
  scrollRef, viewportRef, onReply,
  onPin, onUnpin, onForward,
}: ChatMessageListProps) {
  return (
    <div className="relative flex-1 min-h-0">
      <ScrollArea className="h-full" onScroll={onScroll} viewportRef={viewportRef}>
        <div className="space-y-3 px-3 md:px-5 pb-3 pt-4">
          {isLoading ? (
            <MessageListSkeleton />
          ) : messages.length === 0 ? (
            <MessageListEmpty />
          ) : (
            <MessageItems messages={messages} currentUserId={currentUserId} onDelete={onDelete} onEdit={onEdit} onReply={onReply} onPin={onPin} onUnpin={onUnpin} onForward={onForward} />
          )}

          {isTyping && typingUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-muted">{typingUser[0]}</AvatarFallback>
              </Avatar>
              <TypingIndicator userName={typingUser} />
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {showScrollButton && (
        <button onClick={onScrollToBottom} className="absolute bottom-4 right-5 z-40 h-9 w-9 rounded-full bg-primary text-primary-foreground shadow flex items-center justify-center">
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
