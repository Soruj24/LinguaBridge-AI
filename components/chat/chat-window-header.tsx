"use client";

import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, User, Search, Info, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getLanguageFlag } from "@/types/chat";

interface ChatWindowHeaderProps {
  otherParticipant?: {
    _id: string;
    name: string;
    avatar?: string;
    preferredLanguage: string;
  };
  onToggleSearch: () => void;
  onOpenChatInfo: () => void;
  onOpenClearConfirm: () => void;
}

export function ChatWindowHeader({
  otherParticipant,
  onToggleSearch,
  onOpenChatInfo,
  onOpenClearConfirm,
}: ChatWindowHeaderProps) {
  const router = useRouter();
  const t = useTranslations("Chat");

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-3 md:px-5 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-1 h-9 w-9 shrink-0 rounded-xl hover:bg-muted/70"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {otherParticipant && (
            <button
              onClick={() => router.push(`/profile/${otherParticipant._id}`)}
              className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
            >
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
                  <AvatarImage src={otherParticipant.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                    {otherParticipant.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-[2.5px] border-background" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[15px] truncate">
                    {otherParticipant.name}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[11px] font-medium border border-primary/15">
                    {getLanguageFlag(otherParticipant.preferredLanguage)}
                    {otherParticipant.preferredLanguage === "en"
                      ? "English"
                      : otherParticipant.preferredLanguage}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span>Online</span>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/70">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg"
                onClick={() => router.push(`/profile/${otherParticipant?._id}`)}
              >
                <User className="mr-2.5 h-4 w-4" />
                <span>{t("viewProfile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={onToggleSearch}>
                <Search className="mr-2.5 h-4 w-4" />
                <span>{t("searchChat")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={onOpenChatInfo}>
                <Info className="mr-2.5 h-4 w-4" />
                <span>Chat info</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={onOpenClearConfirm}
              >
                <Trash2 className="mr-2.5 h-4 w-4" />
                <span>{t("clearChat")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
