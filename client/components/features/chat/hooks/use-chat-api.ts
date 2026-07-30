"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  editMessageApi,
  saveToPhrasebookApi,
  archiveChatApi,
  searchGifsApi,
  voiceTranslateApi,
} from "@/lib/repositories/chat.repository";

export function useChatApi() {
  const editMessage = useCallback(async (messageId: string, text: string) => {
    try {
      await editMessageApi(messageId, text);
      return true;
    } catch {
      toast.error("Failed to edit message");
      return false;
    }
  }, []);

  const saveToPhrasebook = useCallback(async (data: {
    originalText: string;
    translatedText: string;
    languageFrom: string;
    languageTo: string;
    sourceMessageId: string;
  }) => {
    try {
      await saveToPhrasebookApi(data);
      toast.success("Saved to phrasebook");
      return true;
    } catch {
      toast.error("Failed to save to phrasebook");
      return false;
    }
  }, []);

  const archiveChat = useCallback(async (chatId: string, action: "archive" | "unarchive") => {
    try {
      await archiveChatApi(chatId, action);
      toast.success(action === "archive" ? "Chat archived" : "Chat unarchived");
      return true;
    } catch {
      toast.error("Failed to archive chat");
      return false;
    }
  }, []);

  const searchGifs = useCallback(async (query: string) => {
    try {
      const res = await searchGifsApi(query);
      return res;
    } catch {
      return [];
    }
  }, []);

  const sendVoiceTranslate = useCallback(async (data: FormData) => {
    try {
      const res = await voiceTranslateApi(data);
      return res;
    } catch {
      toast.error("Failed to translate voice");
      return null;
    }
  }, []);

  return {
    editMessage,
    saveToPhrasebook,
    archiveChat,
    searchGifs,
    sendVoiceTranslate,
  };
}
