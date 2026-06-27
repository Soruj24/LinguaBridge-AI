"use client";

import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, User, Search, Info, Trash2, MoreVertical, Bookmark, Phone, Clock, X, Download, Archive, ArchiveRestore, Pin, PinOff, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { getLanguageFlag } from "@/types/chat";
import { useCall } from "@/components/call-provider";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import type { Message } from "@/types/chat";

interface ChatWindowHeaderProps {
  chatId: string;
  otherParticipant?: {
    _id: string;
    name: string;
    avatar?: string;
    preferredLanguage: string;
  };
  onToggleSearch: () => void;
  onOpenChatInfo: () => void;
  onOpenClearConfirm: () => void;
  onOpenPhrasebook?: () => void;
  scheduledMessages?: Message[];
  onCancelScheduled?: (messageId: string) => void;
  exportChat: (chatId: string, format: "json" | "txt") => Promise<void>;
  isArchived?: boolean;
  onArchiveToggle?: () => void;
  pinnedMessages?: Message[];
  onUnpinMessage?: (messageId: string) => void;
}

export function ChatWindowHeader({
  chatId,
  otherParticipant,
  onToggleSearch,
  onOpenChatInfo,
  onOpenClearConfirm,
  onOpenPhrasebook,
  scheduledMessages,
  onCancelScheduled,
  exportChat,
  isArchived,
  onArchiveToggle,
  pinnedMessages,
  onUnpinMessage,
}: ChatWindowHeaderProps) {
  const router = useRouter();
  const t = useTranslations("Chat");
  const { startCall, activeCall } = useCall();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 shrink-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {otherParticipant && (
            <button
              onClick={() => router.push(`/profile/${otherParticipant._id}`)}
              className="flex items-center gap-3 min-w-0 text-left"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback className="text-xs">{otherParticipant.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-sm truncate">{otherParticipant.name}</h2>
                  <span className="text-[10px] text-muted-foreground">
                    {getLanguageFlag(otherParticipant.preferredLanguage)}
                    {otherParticipant.preferredLanguage === "en" ? "EN" : otherParticipant.preferredLanguage.toUpperCase()}
                  </span>
                  <span title="Encrypted in transit" className="inline-flex"><Lock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" /></span>
                </div>
                <span className="text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                    {otherParticipant.preferredLanguage === "en" ? "EN" : otherParticipant.preferredLanguage.toUpperCase()}
                  </span>
                </span>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {otherParticipant && !activeCall && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => startCall(otherParticipant._id, otherParticipant.name)}
              title="Voice call"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {scheduledMessages && scheduledMessages.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px]">
                    {scheduledMessages.length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3">
                <h4 className="text-sm font-medium mb-2">Scheduled messages</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scheduledMessages.map((msg) => (
                    <div key={msg._id} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs">{msg.originalText}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(msg.scheduledAt!).toLocaleString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {onCancelScheduled && (
                        <button
                          onClick={() => onCancelScheduled(msg._id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {pinnedMessages && pinnedMessages.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px]">
                    {pinnedMessages.length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3">
                <h4 className="text-sm font-medium mb-2">Pinned ({pinnedMessages.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pinnedMessages.map((msg) => (
                    <div key={msg._id} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm">
                      <Pin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{msg.senderId.name}</p>
                        <p className="truncate text-xs">{msg.originalText}</p>
                      </div>
                      {onUnpinMessage && (
                        <button
                          onClick={() => onUnpinMessage(msg._id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive p-0.5"
                          title="Unpin"
                        >
                          <PinOff className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1.5">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm font-normal"
                onClick={() => exportChat(chatId, "json")}
              >
                Export as JSON
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm font-normal"
                onClick={() => exportChat(chatId, "txt")}
              >
                Export as TXT
              </Button>
            </PopoverContent>
          </Popover>
          {onOpenPhrasebook && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenPhrasebook}>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/profile/${otherParticipant?._id}`)}>
                <User className="mr-2 h-4 w-4" />
                <span>{t("viewProfile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={onToggleSearch}>
                <Search className="mr-2 h-4 w-4" />
                <span>{t("searchChat")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={onOpenChatInfo}>
                <Info className="mr-2 h-4 w-4" />
                <span>Chat info</span>
              </DropdownMenuItem>
              {onArchiveToggle && (
                <DropdownMenuItem className="cursor-pointer" onClick={onArchiveToggle}>
                  {isArchived ? (
                    <><ArchiveRestore className="mr-2 h-4 w-4" /><span>Move to inbox</span></>
                  ) : (
                    <><Archive className="mr-2 h-4 w-4" /><span>Archive</span></>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={onOpenClearConfirm}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t("clearChat")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
