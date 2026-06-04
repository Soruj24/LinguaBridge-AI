"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePreferences } from "@/hooks/use-preferences";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SmilePlus, Trash2, Loader2, Volume2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MessageBubbleProps } from "./message-bubble/types";
import { MessageBubbleContent } from "./message-bubble/message-bubble-content";
import { useReactions } from "./message-bubble/use-reactions";
import { useTTS } from "./message-bubble/use-tts";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function MessageBubble({
  message,
  isMe,
  onDelete,
  currentUserId,
  isSameSender,
}: MessageBubbleProps) {
  const t = useTranslations("Chat");
  const { reduceMotion, lowBandwidth } = usePreferences();
  const { data: session } = useSession();
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [viewMode, setViewMode] = useState<"original" | "translated" | "both">(
    isMe ? "original" : message.translatedText ? "translated" : "original",
  );

  useEffect(() => {
    if (
      !isMe &&
      message.translatedText &&
      viewMode === "original" &&
      !message.originalText
    ) {
      setViewMode("translated");
    }
  }, [message.translatedText, isMe]);

  const { groupedReactions, handleReaction } = useReactions(
    currentUserId,
    message.reactions,
    message._id,
  );
  const { isReading, isLoadingTTS, handleTTS } = useTTS();

  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 150, damping: 20 }
      }
      className={cn(
        "flex w-full space-x-2 max-w-full group items-end",
        isSameSender ? "mt-0.5" : "mt-4",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {!isMe && !lowBandwidth && (
        <div className="w-8 shrink-0 flex flex-col justify-end">
          {!isSameSender && (
            <Avatar className="h-8 w-8 mb-0.5">
              <AvatarImage src={message.senderId?.avatar} />
              <AvatarFallback className="bg-muted text-xs">
                {message.senderId?.name?.[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {!isMe && lowBandwidth && !isSameSender && (
        <div className="w-8 shrink-0 flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground w-8 h-8 flex items-center justify-center bg-muted rounded-full">
            {message.senderId?.name?.[0]}
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%] sm:max-w-[65%]",
          isMe && "items-end",
        )}
      >
        <div
          className={cn(
            "relative px-4 py-2.5 shadow-sm text-sm break-words transition-all",
            isMe
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-br-sm shadow-lg shadow-primary/25"
              : "bg-gradient-to-br from-muted/90 via-muted/70 to-muted/50 text-foreground border border-border/30 rounded-2xl rounded-bl-sm",
            isSameSender && isMe && "rounded-tr-md",
            isSameSender && !isMe && "rounded-tl-md",
            (message.voiceUrl || message.translatedVoiceUrl) && "min-w-[200px]",
          )}
        >
          <MessageBubbleContent
            message={message}
            isMe={isMe}
            viewMode={viewMode}
            showPhonetic={showPhonetic}
            lowBandwidth={lowBandwidth}
            t={t}
          />
        </div>

        <div
          className={cn(
            "flex justify-end px-1 mt-1 opacity-70",
            isMe
              ? "text-primary/70 dark:text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          <span className="text-[10px] font-medium">
            {new Date(message.createdAt).toLocaleTimeString(
              session?.user?.preferredLanguage || [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </span>
        </div>

        {Object.keys(groupedReactions).length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-1 z-10",
              isMe ? "justify-end mr-1" : "justify-start ml-1",
            )}
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <Button
                key={emoji}
                variant="secondary"
                size="sm"
                className="h-5 px-1.5 text-[10px] rounded-full bg-background border shadow-sm hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji} <span className="ml-1">{count}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center gap-1",
          isMe ? "order-first mr-2" : "ml-2",
        )}
      >
        {message.phoneticText && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 rounded-full hover:bg-muted",
              showPhonetic
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary",
            )}
            title="Show Phonetic Pronunciation"
            onClick={() => setShowPhonetic(!showPhonetic)}
          >
            <span className="text-[10px] font-bold">Aa</span>
          </Button>
        )}

        {!message.voiceUrl && !message.translatedVoiceUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() =>
              handleTTS(
                isMe
                  ? message.originalText
                  : message.translatedText || message.originalText,
              )
            }
            title="Read Aloud"
          >
            {isLoadingTTS ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isReading ? (
              <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform p-1"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {(isMe || session?.user?.role === "admin") && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(message._id)}
            title="Delete Message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {isMe && (
        <Avatar className="h-8 w-8 mb-0.5 shrink-0 opacity-0 w-0 hidden sm:block">
          <AvatarImage src={message.senderId?.avatar} />
          <AvatarFallback>{message.senderId?.name?.[0]}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}
