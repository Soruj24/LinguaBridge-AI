"use client";

import { SmilePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

export function MessageToolbar({ isMe, onReact }: MessageToolbarProps) {
  return (
    <div className="flex items-center self-center ml-1">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground text-sm p-0.5">
            <SmilePlus className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" side="top">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button key={emoji} className="text-lg hover:scale-125 transition-transform" onClick={() => onReact(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
