"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { toast } from "sonner";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus: "none" | "friends" | "request_sent" | "request_received";
}

export function useAddFriend(onAdded: () => void) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(
          `/api/friends/search?query=${encodeURIComponent(query)}`,
        );
        setUsers(res.data.users ?? []);
      } catch {
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSendRequest = async (recipientId: string) => {
    setSendingIds((prev) => new Set(prev).add(recipientId));
    try {
      await api.post("/api/friends/request", { recipientId });
      toast.success("Friend request sent");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === recipientId
            ? { ...u, friendStatus: "request_sent" as const }
            : u,
        ),
      );
      onAdded();
    } catch (error: unknown) {
      const msg = isAxiosError(error) && error.response?.data?.error;
      toast.error(msg || "Failed to send request");
    } finally {
      setSendingIds((prev) => {
        const n = new Set(prev);
        n.delete(recipientId);
        return n;
      });
    }
  };

  const resetState = () => {
    setQuery("");
    setUsers([]);
  };

  return {
    query,
    setQuery,
    users,
    isSearching,
    sendingIds,
    handleSendRequest,
    resetState,
  };
}
