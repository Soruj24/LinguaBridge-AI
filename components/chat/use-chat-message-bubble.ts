"use client";

import { useState, useCallback } from "react";

export function useChatMessageBubble() {
  const [showActions, setShowActions] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return {
    showActions, setShowActions,
    showTranslation, setShowTranslation,
    copied, handleCopy,
  };
}
