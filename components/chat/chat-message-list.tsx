"use client";

import { Fragment } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TypingIndicator } from "@/components/typing-indicator";
import { TrustBanner } from "@/components/trust-banner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircle, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Message, formatDateLabel, needsDateSeparator } from "@/types/chat";
import { MessageBubble } from "@/components/message-bubble";

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

const skeletonData = [
  { align: "left", width: "w-56", avatar: true },
  { align: "right", width: "w-48", avatar: false },
  { align: "right", width: "w-64", avatar: false },
  { align: "left", width: "w-72", avatar: true },
  { align: "left", width: "w-40", avatar: false },
  { align: "right", width: "w-52", avatar: false },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {skeletonData.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`flex w-full items-end gap-2 ${item.align === "right" ? "justify-end" : "justify-start"}`}
        >
          {item.align === "left" && item.avatar && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          {item.align === "left" && !item.avatar && <div className="w-8 shrink-0" />}
          <div className="space-y-2">
            <Skeleton className={`h-10 rounded-2xl ${item.align === "right" ? "rounded-br-sm" : "rounded-bl-sm"} ${item.width}`} />
            <Skeleton className={`h-3 ${item.align === "right" ? "ml-auto" : ""} w-12 rounded`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("Chat");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center backdrop-blur-sm">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
      </motion.div>
      <h3 className="font-semibold text-lg text-foreground mb-1.5">{t("noMessages")}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{t("noMessagesDesc")}</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        {t("aiWillHelp")}
      </div>
    </motion.div>
  );
}

function MessageItems({
  messages, currentUserId, onDelete,
}: {
  messages: Message[];
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {messages.map((msg, index) => {
        const prevMsg = index > 0 ? messages[index - 1] : undefined;
        const showDateSep = needsDateSeparator(msg, prevMsg);
        const isSameSender = !showDateSep && index > 0 && prevMsg?.senderId?._id === msg.senderId?._id;

        return (
          <Fragment key={msg._id}>
            {showDateSep && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
                <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest shrink-0">
                  {formatDateLabel(msg.createdAt)}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
              </div>
            )}
            <MessageBubble
              message={msg}
              isMe={msg.senderId?._id === currentUserId}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isSameSender={isSameSender}
            />
          </Fragment>
        );
      })}
    </>
  );
}

export function ChatMessageList({
  messages, isLoading, hasMore, currentUserId,
  isTyping, typingUser, showScrollButton,
  onScroll, onDelete, onScrollToBottom,
  scrollRef, viewportRef,
}: ChatMessageListProps) {
  return (
    <div className="relative flex-1 min-h-0">
      <ScrollArea
        className="h-full"
        onScroll={onScroll}
        viewportRef={viewportRef}
      >
        <div className="space-y-3 px-3 md:px-5 pb-3 pt-4">
          <TrustBanner />

          {isLoading ? (
            <LoadingSkeleton />
          ) : messages.length === 0 ? (
            <EmptyState />
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
