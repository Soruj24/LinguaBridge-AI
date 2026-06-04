"use client";

import { useState, useRef } from "react";

export function useMessageInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActions, setShowActions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, onSend: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return {
    textareaRef,
    fileInputRef,
    showActions,
    setShowActions,
    handleKeyDown,
  };
}
