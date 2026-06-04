"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useSocket } from "@/components/socket-provider";
import axios from "axios";
import { toast } from "sonner";
import type { Friend, PendingRequest, ChatItem } from "@/types/sidebar";

export function useSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const socket = useSocket();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PendingRequest[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const userRole = (session?.user as { role?: "user" | "admin" })?.role;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [friendsRes, requestsRes, chatsRes] = await Promise.all([
        axios.get("/api/friends"),
        axios.get("/api/friends/requests"),
        axios.get("/api/chat"),
      ]);
      setFriends(friendsRes.data.friends ?? []);
      setIncomingRequests(requestsRes.data.incoming ?? []);
      setOutgoingRequests(requestsRes.data.outgoing ?? []);
      const chatData = Array.isArray(chatsRes.data) ? chatsRes.data : chatsRes.data?.data || [];
      setChats(chatData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchData();
    }
  }, [session?.user?.email, fetchData]);

  useEffect(() => {
    if (!socket || !session?.user?.id) return;
    socket.emit("set_online", session.user.id);
  }, [socket, session?.user?.id]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", () => fetchData());
    socket.on("friend_request_received", () => fetchData());
    socket.on("friend_request_accepted", () => fetchData());
    socket.on("user_online", ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("friend_request_received");
      socket.off("friend_request_accepted");
      socket.off("user_online");
    };
  }, [socket, fetchData]);

  const chatByUserId = useCallback(() => {
    const map = new Map<string, ChatItem>();
    const myId = session?.user?.id;
    if (!myId) return map;
    for (const chat of chats) {
      for (const p of chat.participants) {
        if (String(p._id) !== String(myId)) {
          map.set(String(p._id), chat);
        }
      }
    }
    return map;
  }, [chats, session?.user?.id]);

  const chatMap = chatByUserId();

  const handleAccept = useCallback(async (requestId: string) => {
    setAcceptingIds((prev) => new Set(prev).add(requestId));
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "accept" });
      toast.success("Friend request accepted");
      fetchData();
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setAcceptingIds((prev) => {
        const n = new Set(prev);
        n.delete(requestId);
        return n;
      });
    }
  }, [fetchData]);

  const handleReject = useCallback(async (requestId: string) => {
    setRejectingIds((prev) => new Set(prev).add(requestId));
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "reject" });
      toast.success("Friend request declined");
      fetchData();
    } catch {
      toast.error("Failed to decline request");
    } finally {
      setRejectingIds((prev) => {
        const n = new Set(prev);
        n.delete(requestId);
        return n;
      });
    }
  }, [fetchData]);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "cancel" });
      toast.success("Request cancelled");
      fetchData();
    } catch {
      toast.error("Failed to cancel request");
    }
  }, [fetchData]);

  const handleUnfriend = useCallback(async (friendshipId: string) => {
    try {
      await axios.delete(`/api/friends/${friendshipId}`);
      toast.success("Friend removed");
      fetchData();
    } catch {
      toast.error("Failed to remove friend");
    }
  }, [fetchData]);

  const handleFriendClick = useCallback((friend: Friend) => {
    const existingChat = chatMap.get(friend.user._id);
    if (existingChat) {
      router.push(`/chat/${existingChat._id}`);
    } else {
      axios
        .post("/api/chat", { receiverId: friend.user._id })
        .then((res) => {
          router.push(`/chat/${res.data._id}`);
        })
        .catch(() => toast.error("Failed to start chat"));
    }
  }, [chatMap, router]);

  const filteredFriends = friends.filter((f) =>
    f.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPending = incomingRequests.length;

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    chats,
    isLoading,
    searchQuery,
    setSearchQuery,
    acceptingIds,
    rejectingIds,
    activeTab,
    setActiveTab,
    onlineUsers,
    chatMap,
    userRole,
    filteredFriends,
    totalPending,
    fetchData,
    handleAccept,
    handleReject,
    cancelRequest,
    handleUnfriend,
    handleFriendClick,
  };
}
