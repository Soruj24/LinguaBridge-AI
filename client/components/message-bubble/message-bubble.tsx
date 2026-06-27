"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reply, BookmarkPlus, Clock, Pencil, Pin, PinOff, Forward } from "lucide-react";
import type { MessageBubbleProps } from "./types";
import { MessageBubbleContent } from "./message-bubble-content";
import { useMessageBubble } from "./use-message-bubble";
import { MessageSenderAvatar } from "./message-sender-avatar";
import { MessageTimestamp } from "./message-timestamp";
import { MessageReactionsDisplay } from "./message-reactions-display";
import { MessageToolbar } from "./message-toolbar";
import { useChatApi } from "@/hooks/use-chat-api";

const EDIT_TIMEOUT_MS = 10 * 60 * 1000;

export function MessageBubble({
  message,
  isMe,
  onDelete,
  currentUserId,
  isSameSender,
  onReply,
  onEdit,
  onPin,
  onUnpin,
  onForward,
}: MessageBubbleProps) {
  const { viewMode, groupedReactions, handleReaction } = useMessageBubble(message, isMe, currentUserId);
  const { editMessage, saveToPhrasebook } = useChatApi();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.originalText);

  const canEdit = isMe &&
    !message.voiceUrl &&
    !message.fileUrl &&
    !message.isImage &&
    Date.now() - new Date(message.createdAt).getTime() < EDIT_TIMEOUT_MS;

  const handleStartEdit = () => {
    setEditText(message.originalText);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.originalText);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.originalText) {
      setIsEditing(false);
      return;
    }
    if (onEdit) {
      onEdit(message._id, trimmed);
    } else {
      const success = await editMessage(message._id, trimmed);
      if (!success) return;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleSaveToPhrasebook = () => {
    if (!message.translatedText) return;
    saveToPhrasebook({
      originalText: message.originalText,
      translatedText: message.translatedText,
      languageFrom: message.languageFrom || "en",
      languageTo: message.languageTo || "en",
      sourceMessageId: message._id,
    });
  };

  const previewText = message.replyTo?.isImage
    ? "📷 Image"
    : message.replyTo?.originalText
      ? message.replyTo.originalText.length > 80
        ? message.replyTo.originalText.slice(0, 80) + "..."
        : message.replyTo.originalText
      : "";

  return (
    <div className={cn("flex w-full gap-1.5 max-w-full items-end group", isSameSender ? "mt-0.5" : "mt-3", isMe ? "justify-end" : "justify-start")}>
      <MessageSenderAvatar senderId={message.senderId} isMe={isMe} isSameSender={isSameSender} lowBandwidth={false} />

      <div className={cn("flex flex-col max-w-[70%] sm:max-w-[65%] relative", isMe && "items-end")}>
        {/* Quick emoji reactions bar */}
        <div className={cn("absolute -top-2.5 z-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150", isMe ? "right-0" : "left-0")}>
          {["👍", "❤️", "😂", "😢", "😮"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="h-6 w-6 flex items-center justify-center text-sm rounded-full bg-background border border-border/40 shadow-sm hover:bg-muted hover:scale-110 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className={cn(
          "px-3.5 py-2 text-sm break-words",
          isMe
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-muted rounded-2xl rounded-bl-sm",
          isSameSender && isMe && "rounded-tr-md",
          isSameSender && !isMe && "rounded-tl-md",
        )}>
          {message.replyTo && (
            <button
              onClick={() => {
                document.getElementById(`message-${message.replyTo!._id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={cn(
                "flex items-center gap-1.5 mb-2 p-1.5 rounded-md text-xs border-l-2 text-left w-full",
                isMe
                  ? "bg-primary-foreground/10 border-primary-foreground/30"
                  : "bg-foreground/5 border-foreground/20",
              )}
            >
              <Reply className="h-3 w-3 shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[11px] opacity-80">
                  {message.replyTo.senderId.name}
                </div>
                <div className="truncate opacity-60">{previewText}</div>
              </div>
            </button>
          )}
          {message.status === "scheduled" && (
            <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
              <Clock className="h-3 w-3" />
              <span>Scheduled for {new Date(message.scheduledAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-background text-foreground rounded-md px-2 py-1.5 text-sm resize-none border border-border focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-[11px] px-2 py-1 rounded bg-muted hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-[11px] px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <MessageBubbleContent message={message} isMe={isMe} viewMode={viewMode} showPhonetic={false} lowBandwidth={false} />
          )}
        </div>

        <MessageTimestamp createdAt={message.createdAt} editedAt={message.editedAt} isMe={isMe} readBy={message.readBy} status={message.status} />

        <MessageReactionsDisplay groupedReactions={groupedReactions} isMe={isMe} onReact={handleReaction} />

        <div className="flex items-center gap-2 mt-1 px-1">
          {canEdit && !isEditing && (
            <button
              onClick={handleStartEdit}
              className={cn(
                "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isMe ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
          {message.translatedText && (
            <button
              onClick={handleSaveToPhrasebook}
              className={cn(
                "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isMe ? "text-primary" : "text-muted-foreground",
              )}
            >
              <BookmarkPlus className="h-3 w-3" />
              Save
            </button>
          )}
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className={cn(
                "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isMe ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
          {message.isPinned ? (
            onUnpin && (
              <button
                onClick={() => onUnpin(message._id)}
                className={cn(
                  "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  isMe ? "text-primary" : "text-muted-foreground",
                )}
              >
                <PinOff className="h-3 w-3" />
                Unpin
              </button>
            )
          ) : (
            onPin && (
              <button
                onClick={() => onPin(message._id)}
                className={cn(
                  "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  isMe ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Pin className="h-3 w-3" />
                Pin
              </button>
            )
          )}
          {onForward && (
            <button
              onClick={() => onForward(message)}
              className={cn(
                "text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isMe ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Forward className="h-3 w-3" />
              Forward
            </button>
          )}
        </div>
      </div>

      <MessageToolbar
        isMe={isMe}
        showPhonetic={false}
        phoneticText={message.phoneticText}
        hasVoice={!!(message.voiceUrl || message.translatedVoiceUrl)}
        isReading={false}
        isLoadingTTS={false}
        messageId={message._id}
        onTogglePhonetic={() => {}}
        onTTS={() => {}}
        onReact={handleReaction}
        onDelete={undefined}
      />
    </div>
  );
}
