"use client";

import { useTranslations } from "next-intl";
import { Loader2, Volume2, Square } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { FileBubble } from "@/components/ui/file-preview";
import { useTTS } from "@/hooks/use-tts";
import type { MessageBubbleMessage } from "./types";

interface MessageBubbleContentProps {
  message: MessageBubbleMessage;
  isMe: boolean;
  viewMode: "original" | "translated" | "both";
  showPhonetic: boolean;
  lowBandwidth: boolean;
}

export function MessageBubbleContent({
  message,
  isMe,
  viewMode,
}: MessageBubbleContentProps) {
  const t = useTranslations("Chat");
  const { playTTS, stopTTS, isPlaying, isLoading } = useTTS();

  const handleListenTranslated = () => {
    if (isPlaying) {
      stopTTS();
    } else if (message.translatedText) {
      playTTS(message.translatedText, message.languageTo);
    }
  };

  const listenButton = message.translatedText ? (
    <button
      onClick={handleListenTranslated}
      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={isPlaying ? "Stop" : "Listen"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  ) : null;

  return (
    <>
      {(message.voiceUrl || message.translatedVoiceUrl) && (
        <div className="space-y-2 mb-2">
          {message.voiceUrl && (
            <div>
              {message.translatedVoiceUrl && <div className="text-[10px] opacity-70 mb-0.5">Original</div>}
              <AudioPlayer src={message.voiceUrl} variant={isMe ? "sender" : "receiver"} />
            </div>
          )}
          {message.translatedVoiceUrl && (
            <div>
              <div className="text-[10px] opacity-70 mb-0.5">{t("translated")}</div>
              <AudioPlayer src={message.translatedVoiceUrl} variant={isMe ? "sender" : "receiver"} />
            </div>
          )}
        </div>
      )}

      {message.fileUrl && (
        <div className="mb-2">
          <FileBubble fileUrl={message.fileUrl} fileType={message.fileType} fileSize={message.fileSize} isImage={message.isImage} fileName={message.originalText} />
        </div>
      )}

      <div className="leading-relaxed whitespace-pre-wrap">
        {viewMode === "both" && message.translatedText ? (
          <div className="space-y-1">
            <div className="text-xs">{message.originalText}</div>
            <div className="text-xs border-t pt-1 border-current/20 flex items-start gap-1">
              <span>{message.translatedText}</span>
              {listenButton}
            </div>
          </div>
        ) : viewMode === "original" ? (
          message.originalText || message.translatedText
        ) : (
          <span className="flex items-start gap-1">
            <span>{message.translatedText || message.originalText}</span>
            {message.translatedText && listenButton}
          </span>
        )}
      </div>

      {(message as { isOptimistic?: boolean }).isOptimistic && (
        <Loader2 className="h-3 w-3 animate-spin mt-1" />
      )}
    </>
  );
}
