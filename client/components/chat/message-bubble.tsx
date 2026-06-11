"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Globe, Volume2 } from "lucide-react";
import { useChatMessageBubble } from "./use-chat-message-bubble";

export interface MessageBubbleProps {
  message: {
    _id: string;
    originalText: string;
    translatedText?: string;
    voiceUrl?: string;
    createdAt: string;
    senderId: { _id: string; name: string; avatar?: string };
    readBy?: string[];
  };
  isOwn: boolean;
  showAvatar?: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  className?: string;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReact,
  className,
}: MessageBubbleProps) {
  const { showTranslation, setShowTranslation } = useChatMessageBubble();

  const displayText = showTranslation && message.translatedText
    ? message.translatedText
    : message.originalText;

  return (
    <div className={cn("flex gap-2 max-w-[75%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto", className)}>
      {!isOwn && showAvatar && (
        <Avatar className="h-7 w-7 mt-auto">
          <AvatarImage src={message.senderId.avatar} />
          <AvatarFallback className="text-xs">{message.senderId.name?.[0]}</AvatarFallback>
        </Avatar>
      )}

      <div>
        <div className={cn("rounded-2xl px-3.5 py-2", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
          {message.translatedText && !isOwn && (
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={cn("flex items-center gap-1 text-[10px] mb-1", showTranslation ? "text-primary font-medium" : "text-muted-foreground")}
            >
              <Globe className="h-3 w-3" />
              {showTranslation ? "Translated" : "Show translation"}
            </button>
          )}

          <p className="text-sm whitespace-pre-wrap">{displayText}</p>

          {message.voiceUrl && (
            <div className="mt-2">
              <Volume2 className="h-4 w-4" />
            </div>
          )}

          <div className={cn("text-[10px] mt-1 flex items-center gap-1", isOwn ? "text-primary-foreground/70 text-right justify-end" : "text-muted-foreground")}>
            {isOwn && (
              <span>{message.readBy && message.readBy.length > 0 ? "Seen" : "Sent"}</span>
            )}
            <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatTypingIndicatorProps {
  name?: string;
  className?: string;
}

export function ChatTypingIndicator({ name, className }: ChatTypingIndicatorProps) {
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
