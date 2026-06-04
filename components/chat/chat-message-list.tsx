"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TypingIndicator } from "@/components/typing-indicator";
import { TrustBanner } from "@/components/trust-banner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Message } from "@/types/chat";
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
  onScrollToBottom: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages, isLoading, hasMore, currentUserId,
  isTyping, typingUser, showScrollButton,
  onScroll, onDelete, onScrollToBottom,
  scrollRef, viewportRef,
}: ChatMessageListProps) {
  return (
    <div className="relative flex-1 min-h-0">
      <ScrollArea className="h-full" onScroll={onScroll} viewportRef={viewportRef}>
        <div className="space-y-3 px-3 md:px-5 pb-3 pt-4">
          <TrustBanner />

          {isLoading ? (
            <MessageListSkeleton />
          ) : messages.length === 0 ? (
            <MessageListEmpty />
          ) : (
            <MessageItems messages={messages} currentUserId={currentUserId} onDelete={onDelete} />
          )}

          {isTyping && typingUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-muted">
                <AvatarFallback className="text-xs bg-muted">{typingUser[0]}</AvatarFallback>
              </Avatar>
              <TypingIndicator userName={typingUser} />
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={onScrollToBottom}
            className="absolute bottom-4 right-5 z-40 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
