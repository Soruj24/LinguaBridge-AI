"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Message } from "@/types/chat";
import {
  fetchScheduledMessagesApi,
  scheduleMessageApi,
  cancelScheduledMessageApi,
} from "@/lib/repositories/chat.repository";

interface UseChatScheduleParams {
  chatId: string;
  scrollToBottom: () => void;
  setNewMessage: (msg: string) => void;
}

export function useChatSchedule({ chatId, scrollToBottom, setNewMessage }: UseChatScheduleParams) {
  const [scheduledMessages, setScheduledMessages] = useState<Message[]>([]);

  const fetchScheduledMessages = useCallback(async () => {
    try {
      const res = await fetchScheduledMessagesApi(chatId);
      setScheduledMessages(res);
    } catch {
      // silently fail
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) fetchScheduledMessages();
  }, [chatId, fetchScheduledMessages]);

  const handleSchedule = useCallback(async (text: string, scheduledAt: string) => {
    try {
      const scheduledMsg = await scheduleMessageApi(chatId, text, scheduledAt);
      setScheduledMessages((prev) => [...prev, scheduledMsg]);
      setNewMessage("");
      scrollToBottom();
      fetchScheduledMessages();
      toast.success("Message scheduled");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule message";
      toast.error(msg);
    }
  }, [chatId, scrollToBottom, fetchScheduledMessages, setNewMessage]);

  const handleCancelScheduled = useCallback(async (messageId: string) => {
    try {
      await cancelScheduledMessageApi(messageId);
      setScheduledMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Scheduled message cancelled");
    } catch {
      toast.error("Failed to cancel scheduled message");
    }
  }, []);

  return {
    scheduledMessages,
    fetchScheduledMessages,
    handleSchedule,
    handleCancelScheduled,
  };
}
