"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Message } from "@/types/chat";
import { fetchMessagesApi, markAsReadApi } from "@/lib/repositories/chat.repository";

interface UseChatMessagesParams {
  chatId: string;
  currentUserId?: string;
  socket: ReturnType<typeof import("@/components/providers/socket-provider").useSocket>;
}

export function useChatMessages({ chatId, currentUserId, socket }: UseChatMessagesParams) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      await markAsReadApi(chatId, messageIds);
      socket?.emit("messages_read", { chatId, messageIds, userId: currentUserId });
    } catch {
      // silently fail
    }
  }, [chatId, socket, currentUserId]);

  const fetchMessages = useCallback(async (before?: string) => {
    try {
      if (before) {
        setIsLoadingMore(true);
        if (viewportRef.current) {
          prevScrollHeightRef.current = viewportRef.current.scrollHeight;
          setIsRestoringScroll(true);
        }
      }

      const url = `/api/chat/${chatId}?limit=20` + (before ? `&before=${before}` : "");
      const res = await fetchMessagesApi(chatId, 20, before);

      if (before) {
        setMessages((prev) => [...res.data.messages, ...prev]);
      } else {
        setMessages(res.data.messages);

        const myId = res.data.chat?.participants?.find(
          (p: { email: string }) => p.email === (window as unknown as { __NEXT_DATA__?: { props?: { session?: { user?: { email?: string } } } } }).__NEXT_DATA__?.props?.session?.user?.email,
        )?._id;

        const unreadIds = res.data.messages
          .filter((m: Message) => m.senderId._id !== myId && !m.readBy?.includes(myId))
          .map((m: Message) => m._id);

        if (unreadIds.length > 0) {
          try {
            await markAsReadApi(chatId, unreadIds);
            socket?.emit("messages_read", { chatId, messageIds: unreadIds, userId: myId });
          } catch {
            // silently fail
          }
        }

        scrollToBottom();
      }
      setHasMore(res.data.hasMore);
    } catch {
      toast.error("Failed to load chat");
    } finally {
      if (!before) {
        setIsLoadingMore(false);
        setIsLoading(false);
      }
    }
  }, [chatId, scrollToBottom, socket]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !isLoadingMore && messages.length > 0) {
      fetchMessages(messages[0].createdAt);
    }
  }, [hasMore, isLoadingMore, messages, fetchMessages]);

  const restoreScrollPosition = useCallback(() => {
    if (isRestoringScroll && viewportRef.current) {
      const diff = viewportRef.current.scrollHeight - prevScrollHeightRef.current;
      if (diff > 0) viewportRef.current.scrollTop = diff;
      setIsRestoringScroll(false);
      setIsLoadingMore(false);
    }
  }, [isRestoringScroll]);

  return {
    messages, setMessages,
    hasMore, setHasMore,
    isLoading, setIsLoading,
    isLoadingMore, setIsLoadingMore,
    isRestoringScroll,
    scrollRef, viewportRef, prevScrollHeightRef,
    scrollToBottom, markMessagesAsRead, fetchMessages,
    onScroll, restoreScrollPosition,
  };
}
