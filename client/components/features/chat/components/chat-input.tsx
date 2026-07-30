"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatFilePreview } from "./file-upload-area";
import { ChatInputActions } from "./emoji-picker";
import { SchedulePicker } from "./schedule-picker";
import type { Message } from "@/types/shared";

interface ChatInputAreaProps {
  newMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSend: () => void;
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
  selectedFile: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  onFileSend: () => void;
  isUploading: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStickerSelect: (emoji: string) => void;
  onGifSelect: (url: string) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  onSchedule?: (scheduledAt: string) => void;
}

export function ChatInputArea({
  newMessage, onInputChange, onSend,
  suggestions, onSuggestionClick,
  selectedFile, onFileSelect, onFileRemove, onFileSend, isUploading,
  isRecording, onStartRecording, onStopRecording,
  onStickerSelect, onGifSelect,
  replyingTo, onCancelReply,
  onSchedule,
}: ChatInputAreaProps) {
  const t = useTranslations("Chat");

  const replyPreviewText = replyingTo?.isImage
    ? "📷 Image"
    : replyingTo?.originalText
      ? replyingTo.originalText.length > 80
        ? replyingTo.originalText.slice(0, 80) + "..."
        : replyingTo.originalText
      : "";

  return (
    <div className="border-t bg-background sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      {replyingTo && onCancelReply && (
        <div className="flex items-center gap-2 px-3 md:px-5 py-1.5 bg-muted/50 border-l-2 border-primary">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-primary">
              Replying to {replyingTo.senderId.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {replyPreviewText}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ChatSuggestions suggestions={suggestions} onSuggestionClick={onSuggestionClick} />

      <ChatFilePreview selectedFile={selectedFile} isUploading={isUploading} onFileRemove={onFileRemove} onFileSend={onFileSend} />

      <div className="flex items-end gap-2 px-3 md:px-5 py-2">
        <div className="flex-1 flex items-end rounded-xl border bg-muted/30 focus-within:border-primary/50 transition-colors">
          <TextareaAutosize
            className="flex-1 bg-transparent px-3 py-2.5 text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
            placeholder={t("typeMessage")}
            value={newMessage}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            minRows={1}
            maxRows={5}
          />
          <ChatInputActions
            isRecording={isRecording}
            onFileSelect={onFileSelect}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onStickerSelect={onStickerSelect}
            onGifSelect={onGifSelect}
          />
        </div>

        {onSchedule && (
          <SchedulePicker
            onSchedule={(scheduledAt) => onSchedule(scheduledAt)}
            onSendNow={onSend}
          />
        )}
        <Button size="icon" onClick={onSend} disabled={!newMessage.trim()} className="h-9 w-9 shrink-0 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
