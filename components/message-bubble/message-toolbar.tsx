"use client";

import { Button } from "@/components/ui/button";
import { SmilePlus, Trash2, Loader2, Volume2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface MessageToolbarProps {
  isMe: boolean;
  showPhonetic: boolean;
  phoneticText?: string;
  hasVoice: boolean;
  isReading: boolean;
  isLoadingTTS: boolean;
  messageId: string;
  onTogglePhonetic: () => void;
  onTTS: () => void;
  onReact: (emoji: string) => void;
  onDelete: (() => void) | undefined;
}

export function MessageToolbar({
  isMe, showPhonetic, phoneticText, hasVoice,
  isReading, isLoadingTTS, messageId,
  onTogglePhonetic, onTTS, onReact, onDelete,
}: MessageToolbarProps) {
  return (
    <div className={cn(
      "opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center gap-1",
      isMe ? "order-first mr-2" : "ml-2",
    )}>
      {phoneticText && (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 rounded-full hover:bg-muted", showPhonetic ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary")}
          title="Show Phonetic Pronunciation"
          onClick={onTogglePhonetic}
        >
          <span className="text-[10px] font-bold">Aa</span>
        </Button>
      )}

      {!hasVoice && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onTTS}
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
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full">
            <SmilePlus className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="text-xl hover:scale-125 transition-transform p-1"
                onClick={() => onReact(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
          onClick={onDelete}
          title="Delete Message"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
