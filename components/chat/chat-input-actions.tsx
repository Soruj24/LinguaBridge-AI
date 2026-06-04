"use client";

import { Paperclip, Mic, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StickerPicker } from "@/components/sticker-picker";

interface ChatInputActionsProps {
  isRecording: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStickerSelect: (emoji: string) => void;
}

export function ChatInputActions({
  isRecording, onFileSelect, onStartRecording, onStopRecording, onStickerSelect,
}: ChatInputActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <input type="file" id="file-upload" className="hidden" onChange={onFileSelect} accept="image/*,.pdf,.doc,.docx,.txt" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10" asChild>
          <span>
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
          </span>
        </Button>
      </label>

      <StickerPicker onSelect={onStickerSelect} />

      {isRecording ? (
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20" onClick={onStopRecording} title="Stop recording">
          <StopCircle className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10" onClick={onStartRecording} title="Voice message">
          <Mic className="h-3.5 w-3.5 text-muted-foreground/70" />
        </Button>
      )}
    </div>
  );
}
