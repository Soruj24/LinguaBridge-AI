"use client";

import { Fragment } from "react";
import { MessageBubble } from "@/components/features/chat/components/message-bubble";
import type { Message } from "@/types/shared";

interface MessageItemsProps {
  messages: Message[];
  currentUserId?: string;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onReply?: (message: Message) => void;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  onForward?: (message: import("@/components/features/chat/components/message-types").MessageBubbleMessage) => void;
}

export function MessageItems({ messages, currentUserId, onDelete, onEdit, onReply, onPin, onUnpin, onForward }: MessageItemsProps) {
  return (
    <>
      {messages.map((msg, index) => {
        const prevMsg = index > 0 ? messages[index - 1] : undefined;
        const showDateSep = (() => {
          if (!prevMsg) return true;
          const curr = new Date(msg.createdAt);
          const prev = new Date(prevMsg.createdAt);
          return curr.toDateString() !== prev.toDateString();
        })();
        const isSameSender = !showDateSep && index > 0 && prevMsg?.senderId?._id === msg.senderId?._id;

        return (
          <Fragment key={msg._id}>
            {showDateSep && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
                <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/60 to-border/0" />
              </div>
            )}
            <div id={`message-${msg._id}`}>
              <MessageBubble
                message={msg}
                isMe={msg.senderId?._id === currentUserId}
                onDelete={onDelete}
                currentUserId={currentUserId}
                isSameSender={isSameSender}
                onEdit={onEdit}
                onReply={onReply ? (m: import("@/components/features/chat/components/types").MessageBubbleMessage) => onReply(m as Message) : undefined}
                onPin={onPin}
                onUnpin={onUnpin}
                onForward={onForward}
              />
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
