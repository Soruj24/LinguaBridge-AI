"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ChatItem {
  _id: string;
  participants?: { name: string; email: string }[];
  updatedAt?: string;
  messageCount?: number;
}

interface ChatListProps {
  chats: ChatItem[];
  loading?: boolean;
  onDeleteChat?: (chatId: string) => void;
  onRefresh?: () => void;
}

export function AdminChatList({
  chats,
  loading,
  onDeleteChat,
  onRefresh,
}: ChatListProps) {
  const handleDelete = (chatId: string) => {
    if (confirm("Delete this chat? All messages will be lost.")) {
      onDeleteChat?.(chatId);
    }
  };

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">All Chats ({chats.length})</h3>
      </div>
      <div className="divide-y">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </div>
            ))
        ) : chats.length ? (
          chats.map((chat) => (
            <div key={chat._id} className="p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {chat.participants
                        ?.map((p) => p.name)
                        .join(", ") || "Group Chat"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {chat.participants?.map((p) => p.email).join(", ")}
                    </p>
                    {chat.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last activity:{" "}
                        {formatDistanceToNow(new Date(chat.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(chat._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No chats found
          </div>
        )}
      </div>
    </div>
  );
}