"use client";

import { usePathname, useRouter } from "@/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, UserPlus, UserCheck, UserX, Plus,
  Loader2, ChevronRight, MoreHorizontal, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/types/sidebar";
import type { Friend, PendingRequest, ChatItem } from "@/types/sidebar";

interface SidebarContentProps {
  isLoading: boolean;
  activeTab: "friends" | "requests";
  searchQuery: string;
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  filteredFriends: Friend[];
  acceptingIds: Set<string>;
  rejectingIds: Set<string>;
  onlineUsers: Set<string>;
  chatMap: Map<string, ChatItem>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancelRequest: (id: string) => void;
  onFriendClick: (friend: Friend) => void;
  onUnfriend: (id: string) => void;
  onOpenAddFriend: () => void;
}

function LoadingSkeleton() {
  return (
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
  );
}

function RequestsList({
  incomingRequests, outgoingRequests,
  acceptingIds, rejectingIds,
  onAccept, onReject, onCancelRequest,
}: {
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  acceptingIds: Set<string>;
  rejectingIds: Set<string>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancelRequest: (id: string) => void;
}) {
  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <UserPlus className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No requests</p>
        <p className="text-xs text-muted-foreground/60 max-w-[180px] leading-relaxed">
          Search for people and send them a friend request
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground/70 truncate">Sent you a request</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    className="h-7 w-7 rounded-lg p-0 bg-primary hover:bg-primary/90"
                    onClick={() => onAccept(req._id)}
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
                    onClick={() => onReject(req._id)}
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
                  onClick={() => onCancelRequest(req._id)}
                  className="text-[10px] text-muted-foreground/40 hover:text-destructive italic opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FriendsList({
  filteredFriends, onlineUsers, chatMap, pathname,
  onFriendClick, onUnfriend, searchQuery, onOpenAddFriend,
}: {
  filteredFriends: Friend[];
  onlineUsers: Set<string>;
  chatMap: Map<string, ChatItem>;
  pathname: string;
  onFriendClick: (friend: Friend) => void;
  onUnfriend: (id: string) => void;
  searchQuery: string;
  onOpenAddFriend: () => void;
}) {
  const router = useRouter();

  if (filteredFriends.length === 0) {
    return (
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
            onClick={onOpenAddFriend}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Friends
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {filteredFriends.map((friend) => {
        const existingChat = chatMap.get(friend.user._id);
        const isActive = pathname === `/chat/${existingChat?._id}`;
        const isOnline = onlineUsers.has(friend.user._id);

        return (
          <div key={friend.friendshipId} className="group relative">
            <button
              onClick={() => onFriendClick(friend)}
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
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-[2px] border-background" />
                )}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold truncate",
                      isActive ? "text-primary" : "text-foreground/80",
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
                    onUnfriend(friend.friendshipId);
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
  );
}

export function SidebarContent(props: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="flex-1">
      {props.isLoading ? (
        <LoadingSkeleton />
      ) : props.activeTab === "requests" ? (
        <div className="p-3">
          <RequestsList
            incomingRequests={props.incomingRequests}
            outgoingRequests={props.outgoingRequests}
            acceptingIds={props.acceptingIds}
            rejectingIds={props.rejectingIds}
            onAccept={props.onAccept}
            onReject={props.onReject}
            onCancelRequest={props.onCancelRequest}
          />
        </div>
      ) : (
        <FriendsList
          filteredFriends={props.filteredFriends}
          onlineUsers={props.onlineUsers}
          chatMap={props.chatMap}
          pathname={pathname}
          onFriendClick={props.onFriendClick}
          onUnfriend={props.onUnfriend}
          searchQuery={props.searchQuery}
          onOpenAddFriend={props.onOpenAddFriend}
        />
      )}
    </ScrollArea>
  );
}
