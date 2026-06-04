"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatFilePreview } from "./chat-file-preview";
import { ChatInputActions } from "./chat-input-actions";
import { ChatRewriteDropdown } from "./chat-rewrite-dropdown";

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
  onRewrite: (tone: string) => void;
  isRewriting: boolean;
  onStickerSelect: (emoji: string) => void;
}

export function ChatInputArea({
  newMessage, onInputChange, onSend,
  suggestions, onSuggestionClick,
  selectedFile, onFileSelect, onFileRemove, onFileSend, isUploading,
  isRecording, onStartRecording, onStopRecording,
  onRewrite, isRewriting, onStickerSelect,
}: ChatInputAreaProps) {
  const t = useTranslations("Chat");

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <ChatSuggestions suggestions={suggestions} onSuggestionClick={onSuggestionClick} />

      <ChatFilePreview selectedFile={selectedFile} isUploading={isUploading} onFileRemove={onFileRemove} onFileSend={onFileSend} />

      <div className="flex items-end gap-2 px-3 md:px-5 py-2.5">
        <div className="flex-1 min-h-[46px] rounded-2xl bg-muted/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-muted/70 border border-border/40 flex flex-col transition-all">
          <TextareaAutosize
            className="w-full bg-transparent border-0 px-4 pt-3 pb-1.5 text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed"
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
          />

          <div className="flex items-center justify-between px-2 pb-1.5">
            <ChatInputActions
              isRecording={isRecording}
              onFileSelect={onFileSelect}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              onStickerSelect={onStickerSelect}
            />
            <span className="text-[10px] text-muted-foreground/50 px-1">
              {newMessage.length > 0 && `${newMessage.length}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ChatRewriteDropdown
            disabled={!newMessage.trim() || isRewriting}
            isRewriting={isRewriting}
            onRewrite={onRewrite}
          />

          <Button
            size="icon"
            onClick={onSend}
            disabled={!newMessage.trim()}
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
