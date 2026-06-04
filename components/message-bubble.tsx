"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { MessageBubbleProps } from "./message-bubble/types";
import { MessageBubbleContent } from "./message-bubble/message-bubble-content";
import { useMessageBubble } from "./message-bubble/use-message-bubble";
import { MessageSenderAvatar } from "./message-bubble/message-sender-avatar";
import { MessageTimestamp } from "./message-bubble/message-timestamp";
import { MessageReactionsDisplay } from "./message-bubble/message-reactions-display";
import { MessageToolbar } from "./message-bubble/message-toolbar";

export function MessageBubble({
  message,
  isMe,
  onDelete,
  currentUserId,
  isSameSender,
}: MessageBubbleProps) {
  const { data: session } = useSession();
  const {
    reduceMotion, lowBandwidth,
    showPhonetic, setShowPhonetic,
    viewMode,
    groupedReactions, handleReaction,
    isReading, isLoadingTTS, handleTTS,
  } = useMessageBubble(message, isMe, currentUserId);
  const canDelete = !!(isMe || session?.user?.role === "admin") && !!onDelete;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
      className={cn("flex w-full space-x-2 max-w-full group items-end", isSameSender ? "mt-0.5" : "mt-4", isMe ? "justify-end" : "justify-start")}
    >
      <MessageSenderAvatar senderId={message.senderId} isMe={isMe} isSameSender={isSameSender} lowBandwidth={lowBandwidth} />

      <div className={cn("flex flex-col max-w-[70%] sm:max-w-[65%]", isMe && "items-end")}>
        <div className={cn(
          "relative px-4 py-2.5 shadow-sm text-sm break-words transition-all",
          isMe
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-br-sm shadow-lg shadow-primary/25"
            : "bg-gradient-to-br from-muted/90 via-muted/70 to-muted/50 text-foreground border border-border/30 rounded-2xl rounded-bl-sm",
          isSameSender && isMe && "rounded-tr-md",
          isSameSender && !isMe && "rounded-tl-md",
          (message.voiceUrl || message.translatedVoiceUrl) && "min-w-[200px]",
        )}>
          <MessageBubbleContent message={message} isMe={isMe} viewMode={viewMode} showPhonetic={showPhonetic} lowBandwidth={lowBandwidth} />
        </div>

        <MessageTimestamp createdAt={message.createdAt} isMe={isMe} />

        <MessageReactionsDisplay groupedReactions={groupedReactions} isMe={isMe} onReact={handleReaction} />
      </div>

      <MessageToolbar
        isMe={isMe}
        showPhonetic={showPhonetic}
        phoneticText={message.phoneticText}
        hasVoice={!!(message.voiceUrl || message.translatedVoiceUrl)}
        isReading={isReading}
        isLoadingTTS={isLoadingTTS}
        messageId={message._id}
        onTogglePhonetic={() => setShowPhonetic(!showPhonetic)}
        onTTS={() => handleTTS(isMe ? message.originalText : message.translatedText || message.originalText)}
        onReact={handleReaction}
        onDelete={canDelete ? () => onDelete(message._id) : undefined}
      />
    </motion.div>
  );
}
