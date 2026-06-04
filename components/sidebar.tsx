"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogOut, Plus, MessageSquare, Settings, Search, Globe,
  Shield, User, UserCog, LayoutDashboard, UserPlus, UserCheck,
  UserX, Loader2, ChevronRight, Users, MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/components/socket-provider";
import { LanguageModal } from "@/components/language-modal";
import { NotificationBell } from "@/components/notification-bell";
import { AddFriendDialog } from "@/components/add-friend-dialog";
import { GroupChatDialog } from "@/components/group-chat-dialog";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Friend {
  friendshipId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  };
  since: string;
}

interface PendingRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
  };
  createdAt: string;
}

interface ChatItem {
  _id: string;
  participants: { _id: string }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

const navItems = [
  { href: "/dashboard", labelKey: "dashboard" as const, icon: LayoutDashboard },
  { href: "/settings", labelKey: "settings" as const, icon: Settings },
] as const;

export function Sidebar({ className, onClose }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const tAuth = useTranslations("Auth");
  const tChat = useTranslations("Chat");
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const socket = useSocket();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PendingRequest[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
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

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredFriends = friends.filter((f) =>
    f.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAccept = async (requestId: string) => {
    setAcceptingIds((prev) => new Set(prev).add(requestId));
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "accept" });
      toast.success("Friend request accepted");
      fetchData();
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setAcceptingIds((prev) => { const n = new Set(prev); n.delete(requestId); return n; });
    }
  };

  const handleReject = async (requestId: string) => {
    setRejectingIds((prev) => new Set(prev).add(requestId));
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "reject" });
      toast.success("Friend request declined");
      fetchData();
    } catch {
      toast.error("Failed to decline request");
    } finally {
      setRejectingIds((prev) => { const n = new Set(prev); n.delete(requestId); return n; });
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await axios.patch(`/api/friends/${requestId}`, { action: "cancel" });
      toast.success("Request cancelled");
      fetchData();
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  const handleUnfriend = async (friendshipId: string) => {
    try {
      await axios.delete(`/api/friends/${friendshipId}`);
      toast.success("Friend removed");
      fetchData();
    } catch {
      toast.error("Failed to remove friend");
    }
  };

  const handleFriendClick = (friend: Friend) => {
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
    onClose?.();
  };

  const totalPending = incomingRequests.length;

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-80 border-r border-border/50 bg-gradient-to-b from-background to-muted/20 shadow-xl z-50",
        className,
      )}
    >
      {/* ── HEADER ── */}
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-border/40 bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all group-hover:scale-105">
              <MessageSquare className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              LinguaBridge
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <GroupChatDialog onChatCreated={fetchData}>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <Users className="h-4 w-4" />
              </Button>
            </GroupChatDialog>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
              onClick={() => setShowAddFriend(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t("search")}
            className="pl-10 h-9 bg-muted/40 border-border/30 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-sm transition-all placeholder:text-muted-foreground/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Nav */}
        <nav className="flex items-center gap-1 -mx-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <div className="flex-1" />
          <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider pr-1">
            Friends
          </span>
        </nav>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-border/30">
        <button
          onClick={() => setActiveTab("friends")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
            activeTab === "friends"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Friends
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center relative",
            activeTab === "requests"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
          )}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Requests
          {totalPending > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/20">
              {totalPending}
            </span>
          )}
        </button>
      </div>

      {/* ── CONTENT ── */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-1 pt-2 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className={cn("h-10 w-10 rounded-full shrink-0", i % 2 ? "bg-muted/40" : "bg-muted/60")} />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className={cn("h-3.5 rounded-md", i % 2 ? "w-28" : "w-36")} />
                  <Skeleton className={cn("h-3 rounded-md", i % 2 ? "w-44" : "w-36")} />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "requests" ? (
          <div className="p-3 space-y-4">
            {incomingRequests.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2 px-1">
                  Incoming ({incomingRequests.length})
                </h3>
                <div className="space-y-1">
                  {incomingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
                        <AvatarImage src={req.user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {req.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{req.user.name}</p>
                        <p className="text-xs text-muted-foreground/70 truncate">
                          Sent you a request
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          className="h-7 w-7 rounded-lg p-0 bg-primary hover:bg-primary/90"
                          onClick={() => handleAccept(req._id)}
                          disabled={acceptingIds.has(req._id)}
                        >
                          {acceptingIds.has(req._id) ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(req._id)}
                          disabled={rejectingIds.has(req._id)}
                        >
                          {rejectingIds.has(req._id) ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserX className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outgoingRequests.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2 px-1">
                  Sent ({outgoingRequests.length})
                </h3>
                <div className="space-y-1">
                  {outgoingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-60 group"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={req.user.avatar} />
                        <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground text-xs font-semibold">
                          {req.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{req.user.name}</p>
                        <p className="text-xs text-muted-foreground/50">Request pending</p>
                      </div>
                      <button
                        onClick={() => cancelRequest(req._id)}
                        className="text-[10px] text-muted-foreground/40 hover:text-destructive italic opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <UserPlus className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No requests</p>
                <p className="text-xs text-muted-foreground/60 max-w-[180px] leading-relaxed">
                  Search for people and send them a friend request
                </p>
              </div>
            )}
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center mb-4 shadow-inner">
              <Users className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-sm text-foreground mb-1">
              {searchQuery ? "No matches" : "No friends yet"}
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-[200px] mb-5 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}"`
                : "Search for people and send them a friend request to start chatting"}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs rounded-lg shadow-sm"
                onClick={() => setShowAddFriend(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Friends
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredFriends.map((friend) => {
              const existingChat = chatMap.get(friend.user._id);
              const isActive = pathname === `/chat/${existingChat?._id}`;

              return (
                <div
                  key={friend.friendshipId}
                  className="group relative"
                >
                  <button
                    onClick={() => handleFriendClick(friend)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full text-left",
                      isActive
                        ? "bg-primary/10 shadow-sm"
                        : "hover:bg-muted/50 active:scale-[0.99]",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        className={cn(
                          "h-10 w-10 border-2 transition-colors",
                          isActive ? "border-primary/20" : "border-transparent",
                        )}
                      >
                        <AvatarImage src={friend.user.avatar} />
                        <AvatarFallback
                          className={cn(
                            "text-sm font-semibold",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted-foreground/10 text-muted-foreground",
                          )}
                        >
                          {friend.user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(friend.user._id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-[2px] border-background" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold truncate",
                            isActive
                              ? "text-primary"
                              : "text-foreground/80",
                          )}
                        >
                          {friend.user.name}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground/50 shrink-0">
                          {existingChat?.lastMessage
                            ? formatTimestamp(existingChat.lastMessage.createdAt)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex-1 text-xs text-muted-foreground/70 truncate">
                          {existingChat?.lastMessage
                            ? existingChat.lastMessage.originalText
                            : <span className="italic opacity-50">Start chatting</span>}
                        </span>
                        {(existingChat?.unreadCount ?? 0) > 0 && (
                          <span className="shrink-0 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/20">
                            {existingChat!.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-all",
                        isActive
                          ? "text-primary opacity-100"
                          : "text-muted-foreground/20 opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute right-1.5 top-1.5 h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 p-1">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${friend.user._id}`);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        className="cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfriend(friend.friendshipId);
                        }}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Unfriend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* ── BOTTOM SECTION ── */}
      <div className="border-t border-border/40 bg-gradient-to-t from-background/80 to-background/30 backdrop-blur-sm p-3 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
              {session?.user?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
            <p className="text-[11px] text-muted-foreground/70 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 justify-start gap-2 text-xs rounded-lg border-border/40 bg-background/40 hover:bg-muted/50"
            onClick={() => setShowLanguageModal(true)}
          >
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            {t("languageRegion")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 justify-start gap-2 text-xs rounded-lg border-border/40 bg-background/40 hover:bg-muted/50"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            {t("settings")}
          </Button>
        </div>

        {userRole === "admin" && (
          <div className="pt-2 border-t border-border/30 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-1">Admin</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 justify-start gap-2 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => router.push(`/${locale}/admin`)}
              >
                <UserCog className="h-3.5 w-3.5" />
                Admin Panel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => router.push(`/${locale}/security`)}
              >
                <Shield className="h-3.5 w-3.5" />
                Security
              </Button>
            </div>
          </div>
        )}

        {userRole !== "admin" && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => router.push(`/${locale}/security`)}
          >
            <Shield className="h-3.5 w-3.5" />
            Security
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-3.5 w-3.5" />
          {tAuth("logout")}
        </Button>
      </div>

      <LanguageModal open={showLanguageModal} onOpenChange={setShowLanguageModal} />
      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} onAdded={fetchData} />
    </div>
  );
}
