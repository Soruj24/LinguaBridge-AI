"use client";

import { useState, useEffect } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { useReactions } from "./use-reactions";
import { useTTS } from "./use-tts";
import type { MessageBubbleMessage } from "./types";

export function useMessageBubble(message: MessageBubbleMessage, isMe: boolean, currentUserId?: string) {
  const { reduceMotion, lowBandwidth } = usePreferences();
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [viewMode, setViewMode] = useState<"original" | "translated" | "both">(
    isMe ? "original" : message.translatedText ? "translated" : "original",
  );

  useEffect(() => {
    if (!isMe && message.translatedText && viewMode === "original" && !message.originalText) {
      setViewMode("translated");
    }
  }, [message.translatedText, isMe]);

  const { groupedReactions, handleReaction } = useReactions(currentUserId, message.reactions, message._id);
  const { isReading, isLoadingTTS, handleTTS } = useTTS();

  return {
    reduceMotion, lowBandwidth,
    showPhonetic, setShowPhonetic,
    viewMode,
    groupedReactions, handleReaction,
    isReading, isLoadingTTS, handleTTS,
  };
}
