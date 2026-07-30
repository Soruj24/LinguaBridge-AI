"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/types/shared";
import { searchMessagesApi } from "@/lib/repositories/chat.repository";

interface UseChatSearchParams {
  chatId: string;
}

export function useChatSearch({ chatId }: UseChatSearchParams) {
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchResultRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await searchMessagesApi(query, chatId);
      setSearchResults(res);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [chatId]);

  const scrollToMessage = useCallback((msgId: string) => {
    const el = searchResultRefs.current.get(msgId) || document.getElementById(`message-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setSearchResults([]);
    }
  }, []);

  return {
    searchResults, setSearchResults,
    isSearching,
    searchResultRefs,
    handleSearch,
    scrollToMessage,
  };
}
