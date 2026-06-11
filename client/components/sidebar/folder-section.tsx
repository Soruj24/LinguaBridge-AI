"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Folder } from "@/types/folders";
import type { Friend, ChatItem } from "@/types/sidebar";

const COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

interface FolderSectionProps {
  folder: Folder;
  friends: Friend[];
  chatMap: Map<string, ChatItem>;
  pathname: string;
  onFriendClick: (friend: Friend) => void;
  onDeleteFolder: (id: string) => void;
}

export function FolderSection({
  folder,
  friends,
  chatMap,
  pathname,
  onFriendClick,
  onDeleteFolder,
}: FolderSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (friends.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-1.5 w-full text-left hover:bg-muted/50 rounded-lg transition-colors group"
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform shrink-0",
            collapsed && "-rotate-90"
          )}
        />
        <span
          className={cn("h-2 w-2 rounded-full shrink-0", COLOR_MAP[folder.color] || COLOR_MAP.gray)}
        />
        <span className="text-xs font-medium text-muted-foreground truncate flex-1">
          {folder.name}
        </span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums">{friends.length}</span>
        <Button
          size="icon-xs"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFolder(folder._id);
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground/60" />
        </Button>
      </button>

      {!collapsed && (
        <div className="space-y-0.5 mt-0.5">
          {friends.map((friend) => {
            const existingChat = chatMap.get(friend.user._id);
            const isActive = pathname === `/chat/${existingChat?._id}`;
            return (
              <button
                key={friend.friendshipId}
                onClick={() => onFriendClick(friend)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors w-full text-left ml-4",
                  isActive ? "bg-primary/[0.06]" : "hover:bg-muted/50"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", COLOR_MAP[folder.color] || COLOR_MAP.gray)} />
                <span className={cn("text-sm truncate", isActive ? "text-primary font-medium" : "")}>
                  {friend.user.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
