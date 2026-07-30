"use client";

import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Plus, Folder as FolderIcon, FolderPlus, Search, Phone } from "lucide-react";
import { cn } from "@/utils";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/utils/formatting";
import type { Friend, ChatItem, Folder } from "@/types/shared";
import { FolderSection } from "./folder-section";
import { FolderAssignPopover } from "./folder-dialog";
import { useCall } from "@/providers/call-provider";
import { useState, useMemo } from "react";
import { Archive, ArchiveRestore, ChevronDown, ChevronRight, MoreVertical, MessageCircleOff, MessageCircle } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FriendsListProps {
  filteredFriends: Friend[];
  onlineUsers: Set<string>;
  chatMap: Map<string, ChatItem>;
  pathname: string;
  searchQuery: string;
  onFriendClick: (friend: Friend) => void;
  onUnfriend: (id: string) => void;
  onOpenAddFriend: () => void;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onAssignChatToFolder: (chatId: string, folderId: string | null) => void;
  getFolderForChat: (chatId: string) => Folder | undefined;
  onUnarchiveChat: (chatId: string) => void;
}

export function FriendsList({
  filteredFriends, onlineUsers, chatMap, pathname,
  onFriendClick, onUnfriend, searchQuery, onOpenAddFriend,
  folders, onCreateFolder, onDeleteFolder, onAssignChatToFolder, getFolderForChat,
  onUnarchiveChat,
}: FriendsListProps) {
  const router = useRouter();
  const { startCall, activeCall } = useCall();
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const archivedFriendIds = useMemo(() => {
    const ids = new Set<string>();
    for (const friend of filteredFriends) {
      const chat = chatMap.get(friend.user._id);
      if (chat?.isArchived) ids.add(friend.user._id);
    }
    return ids;
  }, [filteredFriends, chatMap]);

  const archivedFriends = useMemo(
    () => filteredFriends.filter((f) => archivedFriendIds.has(f.user._id)),
    [filteredFriends, archivedFriendIds],
  );

  const activeFilteredFriends = useMemo(
    () => filteredFriends.filter((f) => !archivedFriendIds.has(f.user._id)),
    [filteredFriends, archivedFriendIds],
  );

  const unassignedFriends = activeFilteredFriends.filter((f) => {
    const chat = chatMap.get(f.user._id);
    return !chat || !chat.folderId || !folders.some((fol) => fol._id === chat.folderId);
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setShowCreateInput(false);
    }
  };

  const [showArchived, setShowArchived] = useState(false);

  if (filteredFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-sm mb-1">
          {searchQuery ? "No matches" : "No friends yet"}
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
          {searchQuery ? `"${searchQuery}"` : "Search for people and send them a friend request"}
        </p>
        {!searchQuery && (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onOpenAddFriend}>
            <Plus className="h-3.5 w-3.5" />
            Add Friends
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-medium text-muted-foreground">Friends</span>
        {showCreateInput ? (
          <div className="flex items-center gap-1">
            <Input
              placeholder="Folder name..."
              className="h-7 text-xs w-28 px-2"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowCreateInput(false); setNewFolderName(""); }
              }}
              autoFocus
            />
            <Button size="icon-xs" variant="ghost" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              <FolderPlus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setShowCreateInput(true)}
            title="Create folder"
          >
            <FolderIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {folders.map((folder) => {
        const folderFriends = activeFilteredFriends.filter((f) => {
          const chat = chatMap.get(f.user._id);
          return chat?.folderId === folder._id;
        });
        return (
          <FolderSection
            key={folder._id}
            folder={folder}
            friends={folderFriends}
            chatMap={chatMap}
            pathname={pathname}
            onFriendClick={onFriendClick}
            onDeleteFolder={onDeleteFolder}
          />
        );
      })}

      {unassignedFriends.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground/60">All Friends</span>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{unassignedFriends.length}</span>
          </div>
          {unassignedFriends.map((friend) => {
            const existingChat = chatMap.get(friend.user._id);
            const isActive = pathname === `/chat/${existingChat?._id}`;
            const isOnline = onlineUsers.has(friend.user._id);
            const currentFolder = existingChat ? getFolderForChat(existingChat._id) : undefined;

            return (
              <div key={friend.friendshipId} className="group">
                <button
                  onClick={() => onFriendClick(friend)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
                    isActive ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={friend.user.avatar} />
                      <AvatarFallback className="text-xs">{friend.user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm font-medium truncate", isActive ? "text-primary" : "")}>
                        {friend.user.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {existingChat?.lastMessage ? formatTimestamp(existingChat.lastMessage.createdAt) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex-1 text-xs text-muted-foreground truncate">
                        {existingChat?.lastMessage
                          ? existingChat.lastMessage.originalText
                          : <span className="italic opacity-50">Start chatting</span>}
                      </span>
                      {(existingChat?.unreadCount ?? 0) > 0 && (
                        <span className="shrink-0 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {existingChat!.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {!activeCall && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startCall(friend.user._id, friend.user.name);
                        }}
                        className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Voice call"
                      >
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                    {existingChat && (
                      <FolderAssignPopover
                        folders={folders}
                        currentFolderId={currentFolder?._id}
                        onAssign={(folderId) => onAssignChatToFolder(existingChat._id, folderId)}
                        onCreateFolder={onCreateFolder}
                      />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {archivedFriends.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 px-3 py-1.5 w-full text-left hover:bg-muted rounded-lg transition-colors"
          >
            {showArchived ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Archived</span>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{archivedFriends.length}</span>
          </button>
          {showArchived && (
            <div className="mt-1 space-y-0.5">
              {archivedFriends.map((friend) => {
                const existingChat = chatMap.get(friend.user._id);
                const isActive = pathname === `/chat/${existingChat?._id}`;
                const isOnline = onlineUsers.has(friend.user._id);

                return (
                  <div key={friend.friendshipId} className="group">
                    <button
                      onClick={() => onFriendClick(friend)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left opacity-60 hover:opacity-100",
                        isActive ? "bg-primary/10" : "hover:bg-muted",
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={friend.user.avatar} />
                          <AvatarFallback className="text-xs">{friend.user.name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-sm font-medium truncate", isActive ? "text-primary" : "")}>
                            {friend.user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {existingChat?.lastMessage ? formatTimestamp(existingChat.lastMessage.createdAt) : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex-1 text-xs text-muted-foreground truncate">
                            {existingChat?.lastMessage
                              ? existingChat.lastMessage.originalText
                              : <span className="italic opacity-50">Start chatting</span>}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (existingChat) onUnarchiveChat(existingChat._id);
                          }}
                          className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Unarchive"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
