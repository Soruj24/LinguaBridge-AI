"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus: string;
}

export function useGroupChat(onChatCreated?: () => void) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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
        setUsers(
          (res.data.users ?? []).filter(
            (u: SearchUser) => u.friendStatus === "friends",
          ),
        );
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

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("groupDescription", groupDescription);
      selectedUsers.forEach((id) => formData.append("participantIds", id));

      const res = await api.post("/api/chat/group", formData);
      onChatCreated?.();
      router.push(`/chat/${res.data._id}`);
      router.refresh();
      toast.success("Group created!");
    } catch {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const resetState = () => {
    setQuery("");
    setUsers([]);
    setSelectedUsers([]);
    setGroupName("");
    setGroupDescription("");
  };

  return {
    query,
    setQuery,
    users,
    selectedUsers,
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    isSearching,
    isCreating,
    toggleUser,
    createGroup,
    resetState,
  };
}
