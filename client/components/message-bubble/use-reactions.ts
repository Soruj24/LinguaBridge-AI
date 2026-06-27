"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Reaction } from "./types";

export function useReactions(
  currentUserId: string | undefined,
  reactions: Reaction[] | undefined,
  messageId: string,
) {
  const [localReactions, setLocalReactions] = useState<Reaction[]>(
    reactions || [],
  );

  useEffect(() => {
    if (reactions) {
      setLocalReactions(reactions);
    }
  }, [reactions]);

  const groupedReactions = localReactions.reduce(
    (acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) return;

    const existingIndex = localReactions.findIndex(
      (r) => r.emoji === emoji && r.userId === currentUserId,
    );

    const newReactions = [...localReactions];
    if (existingIndex > -1) {
      newReactions.splice(existingIndex, 1);
    } else {
      newReactions.push({ emoji, userId: currentUserId });
    }
    setLocalReactions(newReactions);

    try {
      await api.post(`/api/chat/message/${messageId}/react`, { emoji });
    } catch (error) {
      console.error("Failed to react", error);
      setLocalReactions(reactions || []);
    }
  };

  return { groupedReactions, handleReaction };
}
