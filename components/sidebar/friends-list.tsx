"use client";

import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, User, UserX, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestamp, type Friend, type ChatItem } from "@/types/sidebar";

interface FriendsListProps {
  filteredFriends: Friend[];
  onlineUsers: Set<string>;
  chatMap: Map<string, ChatItem>;
  pathname: string;
  searchQuery: string;
  onFriendClick: (friend: Friend) => void;
  onUnfriend: (id: string) => void;
  onOpenAddFriend: () => void;
}

export function FriendsList({
  filteredFriends, onlineUsers, chatMap, pathname,
  onFriendClick, onUnfriend, searchQuery, onOpenAddFriend,
}: FriendsListProps) {
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
          {searchQuery ? `"${searchQuery}"` : "Search for people and send them a friend request to start chatting"}
        </p>
        {!searchQuery && (
          <Button size="sm" className="h-8 gap-1.5 text-xs rounded-lg shadow-sm" onClick={onOpenAddFriend}>
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
                <Avatar className={cn("h-10 w-10 border-2 transition-colors", isActive ? "border-primary/20" : "border-transparent")}>
                  <AvatarImage src={friend.user.avatar} />
                  <AvatarFallback className={cn("text-sm font-semibold", isActive ? "bg-primary/20 text-primary" : "bg-muted-foreground/10 text-muted-foreground")}>
                    {friend.user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-[2px] border-background" />
                )}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-sm font-semibold truncate", isActive ? "text-primary" : "text-foreground/80")}>
                    {friend.user.name}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/50 shrink-0">
                    {existingChat?.lastMessage ? formatTimestamp(existingChat.lastMessage.createdAt) : "—"}
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
              <ChevronRight className={cn("h-4 w-4 shrink-0 transition-all", isActive ? "text-primary opacity-100" : "text-muted-foreground/20 opacity-0 group-hover:opacity-100")} />
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
                <DropdownMenuItem className="cursor-pointer rounded-md" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${friend.user._id}`); }}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onUnfriend(friend.friendshipId); }}>
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
