"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Send, Sparkles, Wand2, Image, Mic, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMessageInput } from "./use-message-input";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceRecord?: () => void;
  onStopRecording?: () => void;
  onFileUpload?: () => void;
  onTranslate?: () => void;
  onRewrite?: () => void;
  isRecording?: boolean;
  isTranslating?: boolean;
  isRewriting?: boolean;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  value, onChange, onSend,
  onVoiceRecord, onStopRecording, onFileUpload,
  onTranslate, onRewrite,
  isRecording = false, isTranslating = false, isRewriting = false,
  isSending = false, disabled = false, placeholder, className,
}: MessageInputProps) {
  const { textareaRef, fileInputRef, showActions, setShowActions, handleKeyDown } = useMessageInput();

  const handleFileChange = () => onFileUpload?.();

  return (
    <div className={cn("border-t bg-card p-4", className)}>
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-muted/50 rounded-2xl relative">
          <TextareaAutosize
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, onSend)}
            onFocus={() => setShowActions(true)}
            onBlur={() => setTimeout(() => setShowActions(false), 200)}
            placeholder={placeholder || "Type a message..."}
            disabled={disabled || isSending}
            className="w-full bg-transparent border-0 resize-none focus:ring-0 focus:outline-none min-h-[44px] max-h-[200px] p-3 pr-20 text-sm"
            rows={1}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <input ref={fileInputRef} type="file" accept="image/*,audio/*" onChange={handleFileChange} className="hidden" />

            {isRecording ? (
              <Button type="button" size="sm" variant="destructive" onClick={onStopRecording} className="h-8 w-8 rounded-full p-0">
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" size="sm" variant="ghost" onClick={onVoiceRecord} className="h-8 w-8 rounded-full p-0">
                <Mic className="h-4 w-4" />
              </Button>
            )}

            <Button type="button" size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 rounded-full p-0">
              <Image className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={onTranslate} disabled={isTranslating || !value} className="h-8 px-2">
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>

            <Button type="button" size="sm" variant="ghost" onClick={onRewrite} disabled={isRewriting || !value} className="h-8 px-2">
              {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </Button>

            <Button type="button" size="sm" onClick={onSend} disabled={disabled || !value || isSending} className="h-10 w-10 rounded-full p-0">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
