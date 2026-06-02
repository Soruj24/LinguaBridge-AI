"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Copy,
  Reply,
  Heart,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Globe,
  RefreshCw,
  Check,
  CheckCheck,
} from "lucide-react";
import { useState } from "react";

export interface MessageBubbleProps {
  message: {
    _id: string;
    originalText: string;
    translatedText?: string;
    voiceUrl?: string;
    createdAt: string;
    senderId: { _id: string; name: string; avatar?: string };
  };
  isOwn: boolean;
  showAvatar?: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  onCopy?: (text: string) => void;
  className?: string;
}

const REACTIONS = ["👍", "👎", "❤️", "😂", "😮", "😢"];

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReact,
  onCopy,
  className,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = showTranslation && message.translatedText
      ? message.translatedText
      : message.originalText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(text);
  };

  const displayText = showTranslation && message.translatedText
    ? message.translatedText
    : message.originalText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 max-w-[80%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 mt-auto">
          <AvatarImage src={message.senderId.avatar} />
          <AvatarFallback>{message.senderId.name?.[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className="relative">
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.translatedText && !isOwn && (
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={cn(
                "flex items-center gap-1 text-xs mb-1",
                showTranslation ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              {showTranslation ? "Translated" : "Show translation"}
            </button>
          )}

          <p className="text-sm whitespace-pre-wrap">{displayText}</p>

          {message.voiceUrl && (
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div
            className={cn(
              "text-xs mt-1 flex items-center gap-1",
              isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
            )}
          >
            <span>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {isOwn && (
              <span className="flex items-center">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background rounded-full shadow-md border p-1",
              isOwn ? "right-full mr-2" : "left-full ml-2"
            )}
          >
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact?.(message._id, emoji)}
                className="p-1 hover:bg-muted rounded-full text-sm"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-muted rounded-full"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export function ChatTypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
          </div>
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {name ? `${name} is` : "Is"} typing...
        </p>
      </div>
    </div>
  );
}