"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useSocket } from "@/components/socket-provider";
import axios from "axios";
import { toast } from "sonner";
import { formatLastSeen } from "@/lib/last-seen";
import type { Friend, PendingRequest, ChatItem } from "@/types/sidebar";
import type { Folder } from "@/types/folders";

export function useSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const socket = useSocket();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PendingRequest[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<{ _id: string; blocked: { _id: string; name: string; avatar?: string; bio?: string }; createdAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userLastSeen, setUserLastSeen] = useState<Map<string, { lastSeen: string; showLastSeen: boolean }>>(new Map());

  const userRole = (session?.user as { role?: "user" | "admin" })?.role;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [friendsRes, requestsRes, chatsRes, foldersRes, blockRes] = await Promise.all([
        axios.get("/api/friends"),
        axios.get("/api/friends/requests"),
        axios.get("/api/chat"),
        axios.get("/api/folders"),
        axios.get("/api/block"),
      ]);
      const blocks = Array.isArray(blockRes.data) ? blockRes.data : [];
      setBlockedUsers(blocks);
      const blockedSet = new Set<string>(blocks.map((b: { blocked: { _id: string } }) => b.blocked._id));
      setFriends((friendsRes.data.friends ?? []).filter((f: Friend) => !blockedSet.has(f.user._id)));
      setIncomingRequests(requestsRes.data.incoming ?? []);
      setOutgoingRequests(requestsRes.data.outgoing ?? []);
      const chatData = (Array.isArray(chatsRes.data) ? chatsRes.data : chatsRes.data?.data || []).filter(
        (chat: ChatItem) => {
          const otherParticipant = chat.participants.find(
            (p: { _id: string }) => String(p._id) !== String(session?.user?.id),
          );
          return !otherParticipant || !blockedSet.has(String(otherParticipant._id));
        },
      );
      setChats(chatData);
      setFolders(foldersRes.data.folders ?? []);
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
    socket.on("friend_request_received", (data: { requestId: string; sender: { name: string; _id: string; avatar?: string } }) => {
      fetchData();
      if (data?.sender?.name) {
        setActiveTab("requests");
        toast(`${data.sender.name} sent you a friend request`, {
          action: {
            label: "View",
            onClick: () => setActiveTab("requests"),
          },
          duration: 8000,
        });
      }
    });
    socket.on("friend_request_accepted", () => fetchData());
    socket.on("user_online", ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socket.on("user_status_change", (data: { userId: string; isOnline: boolean; lastSeen?: string; showLastSeen?: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.isOnline) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
      setUserLastSeen((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          lastSeen: data.lastSeen || new Date().toISOString(),
          showLastSeen: data.showLastSeen ?? true,
        });
        return next;
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("friend_request_received");
      socket.off("friend_request_accepted");
      socket.off("user_online");
      socket.off("user_status_change");
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

  const createFolder = useCallback(async (name: string, color?: string) => {
    try {
      const res = await axios.post("/api/folders", { name, color });
      const folder = res.data.folder;
      setFolders((prev) => [...prev, folder]);
      toast.success(`Folder "${name}" created`);
      return folder;
    } catch {
      toast.error("Failed to create folder");
      return null;
    }
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      await axios.delete(`/api/folders/${folderId}`);
      setFolders((prev) => prev.filter((f) => f._id !== folderId));
      toast.success("Folder deleted");
    } catch {
      toast.error("Failed to delete folder");
    }
  }, []);

  const assignChatToFolder = useCallback(async (chatId: string, folderId: string | null) => {
    try {
      if (folderId) {
        await axios.post(`/api/folders/${folderId}/chats`, { chatId });
      } else {
        const currentFolder = folders.find((f) => f.chatIds.includes(chatId));
        if (currentFolder) {
          await axios.delete(`/api/folders/${currentFolder._id}/chats`, { data: { chatId } });
        }
      }
      const foldersRes = await axios.get("/api/folders");
      setFolders(foldersRes.data.folders ?? []);
    } catch {
      toast.error("Failed to assign folder");
    }
  }, [folders]);

  const getFolderForChat = useCallback((chatId: string): Folder | undefined => {
    return folders.find((f) => f.chatIds.includes(chatId));
  }, [folders]);

  const blockedUserIds = useMemo(
    () => new Set(blockedUsers.map((b) => b.blocked._id)),
    [blockedUsers],
  );

  const handleUnblock = useCallback(async (userId: string) => {
    const block = blockedUsers.find((b) => b.blocked._id === userId);
    if (!block) return;
    try {
      await axios.delete(`/api/block/${block._id}`);
      setBlockedUsers((prev) => prev.filter((b) => b._id !== block._id));
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    }
  }, [blockedUsers]);

  const getLastSeen = useCallback((userId: string): string | null => {
    const isOnline = onlineUsers.has(userId);
    const lastSeenData = userLastSeen.get(userId);
    if (!lastSeenData) return null;
    return formatLastSeen(lastSeenData.lastSeen, lastSeenData.showLastSeen, isOnline);
  }, [onlineUsers, userLastSeen]);

  const markUnread = useCallback(async (chatId: string) => {
    try {
      await axios.post(`/api/chat/${chatId}/unread`, { action: "mark" });
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { ...c, markedUnreadBy: [...(c.markedUnreadBy || []), session?.user?.id as string] }
            : c,
        ),
      );
    } catch {
      toast.error("Failed to mark as unread");
    }
  }, [session?.user?.id]);

  const clearUnread = useCallback(async (chatId: string) => {
    try {
      await axios.post(`/api/chat/${chatId}/unread`, { action: "clear" });
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { ...c, markedUnreadBy: (c.markedUnreadBy || []).filter((id) => id !== session?.user?.id) }
            : c,
        ),
      );
    } catch {
      toast.error("Failed to clear unread");
    }
  }, [session?.user?.id]);

  const unreadChatIds = useMemo(
    () => new Set(
      chats
        .filter((c) => (c.markedUnreadBy || []).includes(session?.user?.id as string))
        .map((c) => c._id),
    ),
    [chats, session?.user?.id],
  );

  const isChatUnread = useCallback(
    (chatId: string): boolean => unreadChatIds.has(chatId),
    [unreadChatIds],
  );

  const archiveChat = useCallback(async (chatId: string) => {
    try {
      await axios.post(`/api/chat/${chatId}/archive`, { action: "archive" });
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId ? { ...c, isArchived: true, archivedAt: new Date().toISOString() } : c,
        ),
      );
      toast.success("Chat archived");
    } catch {
      toast.error("Failed to archive chat");
    }
  }, []);

  const unarchiveChat = useCallback(async (chatId: string) => {
    try {
      await axios.post(`/api/chat/${chatId}/archive`, { action: "unarchive" });
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId ? { ...c, isArchived: false, archivedAt: null } : c,
        ),
      );
      toast.success("Chat moved to inbox");
    } catch {
      toast.error("Failed to unarchive chat");
    }
  }, []);

  const archivedChats = useMemo(
    () => chats.filter((c) => c.isArchived),
    [chats],
  );

  const activeChats = useMemo(
    () => chats.filter((c) => !c.isArchived),
    [chats],
  );

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    chats,
    folders,
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
    blockedUsers,
    blockedUserIds,
    fetchData,
    handleAccept,
    handleReject,
    cancelRequest,
    handleUnfriend,
    handleFriendClick,
    handleUnblock,
    createFolder,
    deleteFolder,
    assignChatToFolder,
    getFolderForChat,
    getLastSeen,
    userLastSeen,
    archiveChat,
    unarchiveChat,
    archivedChats,
    activeChats,
    markUnread,
    clearUnread,
    isChatUnread,
    unreadChatIds,
  };
}
