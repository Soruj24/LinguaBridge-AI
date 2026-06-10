"use client";

import { useState, useEffect } from "react";
import { useReactions } from "./use-reactions";
import type { MessageBubbleMessage } from "./types";

export function useMessageBubble(message: MessageBubbleMessage, isMe: boolean, currentUserId?: string) {
  const [viewMode, setViewMode] = useState<"original" | "translated" | "both">(
    isMe ? "original" : message.translatedText ? "translated" : "original",
  );

  useEffect(() => {
    if (!isMe && message.translatedText && viewMode === "original" && !message.originalText) {
      setViewMode("translated");
    }
  }, [message.translatedText, isMe]);

  const { groupedReactions, handleReaction } = useReactions(currentUserId, message.reactions, message._id);

  return { viewMode, groupedReactions, handleReaction };
}
