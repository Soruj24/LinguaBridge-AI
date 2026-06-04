"use client";

import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Wand2, Paperclip, StopCircle, Mic, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import { StickerPicker } from "@/components/sticker-picker";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
  const [showScrollButton] = useState(false);

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      {/* Smart Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto px-3 md:px-5 pt-3 pb-2 scrollbar-hide">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-sm font-medium text-foreground hover:from-primary/20 hover:to-primary/10 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3 text-primary shrink-0" />
                  <span>{suggestion}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 md:px-5"
          >
            <div className="py-2">
              <FilePreview file={selectedFile} onRemove={onFileRemove} />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={onFileSend} disabled={isUploading} className="h-8 rounded-lg text-xs gap-1.5 bg-primary hover:bg-primary/90">
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input */}
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
            <div className="flex items-center gap-0.5">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={onFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10" asChild>
                  <span>
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </span>
                </Button>
              </label>

              <StickerPicker onSelect={onStickerSelect} />

              {isRecording ? (
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20"
                  onClick={onStopRecording}
                  title="Stop recording"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-muted-foreground/10"
                  onClick={onStartRecording}
                  title="Voice message"
                >
                  <Mic className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
              )}
            </div>

            <span className="text-[10px] text-muted-foreground/50 px-1">
              {newMessage.length > 0 && `${newMessage.length}`}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="h-11 w-11 rounded-xl hover:bg-muted/50 hidden sm:inline-flex"
                disabled={!newMessage.trim() || isRewriting}
                title="Rewrite"
              >
                <Wand2 className={cn("h-4 w-4", isRewriting ? "animate-spin text-primary" : "text-muted-foreground/70")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1">
              {["Formal", "Casual", "Professional", "Friendly", "Concise"].map((tone) => (
                <DropdownMenuItem
                  key={tone}
                  onClick={() => onRewrite(tone)}
                  className="cursor-pointer rounded-md"
                >
                  <span className="mr-2 text-base">
                    {tone === "Formal" && "👔"}
                    {tone === "Casual" && "😎"}
                    {tone === "Professional" && "💼"}
                    {tone === "Friendly" && "😊"}
                    {tone === "Concise" && "✂️"}
                  </span>
                  {tone}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
