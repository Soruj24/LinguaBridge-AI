"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
  };
  updatedAt: string;
}

export function useRecentConversations() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await axios.get("/api/chat");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const sorted = data.sort(
          (a: Chat, b: Chat) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setChats(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (session?.user && axios.defaults.headers.common["Authorization"]) {
      fetchChats();
    }
  }, [session, axios.defaults.headers.common["Authorization"]]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.email !== session?.user?.email);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - msgDate.getTime()) / 86400000,
    );

    if (diffDays === 0) {
      return msgDate.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return msgDate.toLocaleDateString(locale, { weekday: "short" });
    } else {
      return msgDate.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return { chats, isLoading, getOtherParticipant, formatTime };
}
