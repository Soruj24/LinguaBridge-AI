"use client";

import { Paperclip, Mic, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GifPicker } from "@/components/gif-picker";

interface ChatInputActionsProps {
  isRecording: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStickerSelect: (emoji: string) => void;
  onGifSelect: (url: string) => void;
}

export function ChatInputActions({
  isRecording, onFileSelect, onStartRecording, onStopRecording, onStickerSelect, onGifSelect,
}: ChatInputActionsProps) {
  return (
    <div className="flex items-center pr-2">
      <input type="file" id="file-upload" className="hidden" onChange={onFileSelect} accept="image/*,.pdf,.doc,.docx,.txt" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" asChild>
          <span><Paperclip className="h-3.5 w-3.5 text-muted-foreground" /></span>
        </Button>
      </label>

      <GifPicker onSelect={onStickerSelect} onGifSelect={onGifSelect} />

      {isRecording ? (
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-red-500" onClick={onStopRecording} title="Stop recording">
          <StopCircle className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={onStartRecording} title="Voice message">
          <Mic className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
