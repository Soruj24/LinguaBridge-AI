"use client";

import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio-player";
import { FileBubble } from "@/components/ui/file-preview";
import type { MessageBubbleMessage } from "./types";

interface MessageBubbleContentProps {
  message: MessageBubbleMessage;
  isMe: boolean;
  viewMode: "original" | "translated" | "both";
  showPhonetic: boolean;
  lowBandwidth: boolean;
  t: (key: string) => string;
}

export function MessageBubbleContent({
  message,
  isMe,
  viewMode,
  showPhonetic,
  lowBandwidth,
  t,
}: MessageBubbleContentProps) {
  return (
    <>
      {(message.voiceUrl || message.translatedVoiceUrl) && !lowBandwidth && (
        <div className="space-y-3 mb-2">
          {message.voiceUrl && (
            <div className="space-y-1">
              {message.translatedVoiceUrl && (
                <div className="text-[10px] opacity-70 ml-1 font-medium">
                  Original
                </div>
              )}
              <AudioPlayer
                src={message.voiceUrl}
                variant={isMe ? "sender" : "receiver"}
              />
            </div>
          )}
          {message.translatedVoiceUrl && (
            <div className="space-y-1">
              <div className="text-[10px] opacity-70 ml-1 font-medium">
                {t("translated")}
              </div>
              <AudioPlayer
                src={message.translatedVoiceUrl}
                variant={isMe ? "sender" : "receiver"}
              />
            </div>
          )}
        </div>
      )}

      {(message.voiceUrl || message.translatedVoiceUrl) && lowBandwidth && (
        <div className="mb-2 p-2 bg-background/20 rounded border border-current/10 text-xs italic opacity-80 flex items-center gap-2">
          <Volume2 className="h-3 w-3" />
          <span>{t("audioHidden")}</span>
        </div>
      )}

      {message.fileUrl && (
        <div className="mb-2">
          <FileBubble
            fileUrl={message.fileUrl}
            fileType={message.fileType}
            fileSize={message.fileSize}
            isImage={message.isImage}
            fileName={message.originalText}
          />
        </div>
      )}

      <div className="leading-relaxed whitespace-pre-wrap">
        {viewMode === "both" && message.translatedText ? (
          <div className="space-y-1.5">
            <div className="opacity-80 text-xs pb-1.5 border-b border-white/10 dark:border-black/10">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 block">
                {message.languageFrom || t("original")}
              </span>
              {message.originalText}
            </div>
            <div className="text-xs pt-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 block">
                {message.languageTo || t("translated")}
              </span>
              {message.translatedText}
            </div>
          </div>
        ) : viewMode === "original" ? (
          message.originalText || message.translatedText
        ) : (
          message.translatedText || message.originalText
        )}

        {showPhonetic && message.phoneticText && (
          <div className="mt-2 pt-2 border-t border-dashed border-current/20 text-xs italic opacity-80 font-mono">
            <span className="text-[9px] font-bold uppercase not-italic opacity-60 mr-1">
              {t("ipa")}
            </span>
            {message.phoneticText}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-1 select-none absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isMe ? "text-primary-foreground/70" : "text-foreground/50",
        )}
      >
        {message.hasOwnProperty("isOptimistic") &&
          (message as { isOptimistic?: boolean }).isOptimistic && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
      </div>
    </>
  );
}
