"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Forward, Search } from "lucide-react";
import type { ChatItem } from "@/types/shared";
import { getLanguageFlag } from "@/utils/helpers";
import type { MessageBubbleMessage } from "@/components/features/chat/components/message-types";

interface ForwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: MessageBubbleMessage | null;
  chats: ChatItem[];
  onForward: (messageId: string, targetChatId: string) => Promise<unknown>;
}

export function ForwardDialog({
  open, onOpenChange, message, chats, onForward,
}: ForwardDialogProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const other = chat.participants.find(
        (p: { _id: string; name?: string }) => p._id !== session?.user?.id,
      );
      const name = (other as { name?: string } | undefined)?.name || "";
      return name.toLowerCase().includes(q);
    });
  }, [chats, searchQuery, session?.user?.id]);

  const getOtherParticipant = (chat: ChatItem) => {
    return chat.participants.find(
      (p) => p._id !== session?.user?.id,
    ) || chat.participants[0];
  };

  const handleForward = async (targetChatId: string) => {
    if (!message) return;
    setForwardingId(targetChatId);
    try {
      await onForward(message._id, targetChatId);
      onOpenChange(false);
    } catch {
      // toast handled by parent
    } finally {
      setForwardingId(null);
    }
  };

  const previewText = message
    ? message.originalText.length > 100
      ? message.originalText.slice(0, 100) + "..."
      : message.originalText
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Forward className="h-4 w-4" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        {message && (
          <div className="mx-6 mb-3 bg-muted/60 rounded-lg p-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Forwarded
            </span>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {previewText}
            </p>
          </div>
        )}

        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 px-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              No chats found
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredChats.map((chat) => {
                const other = getOtherParticipant(chat);
                const otherName = (other as { name?: string })?.name || "Unknown";
                const otherLang = (other as { preferredLanguage?: string })?.preferredLanguage;
                const isForwarding = forwardingId === chat._id;

                return (
                  <button
                    key={chat._id}
                    onClick={() => handleForward(chat._id)}
                    disabled={isForwarding}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-50"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {otherName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {otherName}
                      </div>
                    </div>
                    {otherLang && (
                      <span className="text-lg shrink-0">
                        {getLanguageFlag(otherLang)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
