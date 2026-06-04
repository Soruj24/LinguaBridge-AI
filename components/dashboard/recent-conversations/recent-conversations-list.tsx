"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  lastMessage?: {
    originalText: string;
    createdAt: string;
  };
  updatedAt: string;
}

interface RecentConversationsListProps {
  chats: Chat[];
  isLoading: boolean;
  getOtherParticipant: (chat: Chat) => Chat["participants"][number] | undefined;
  formatTime: (date: string) => string;
  t: (key: string) => string;
}

export function RecentConversationsList({
  chats,
  isLoading,
  getOtherParticipant,
  formatTime,
  t,
}: RecentConversationsListProps) {
  if (isLoading) {
    return Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[160px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      </div>
    ));
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 shadow-inner">
          <MessageCircle className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {t("noConversations")}
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Start a new conversation to see it here
        </p>
      </div>
    );
  }

  return chats.map((chat, index) => {
    const other = getOtherParticipant(chat);
    return (
      <motion.div
        key={chat._id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 + index * 0.05 }}
      >
        <Link
          href={`/chat/${chat._id}`}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-all group border border-transparent hover:border-border/60"
        >
          <div className="relative shrink-0">
            <Avatar className="h-11 w-11 border-2 border-border/50 group-hover:border-primary/30 transition-colors">
              <AvatarImage src={other?.avatar} alt={other?.name} />
              <AvatarFallback
                className={cn(
                  "font-medium text-sm",
                  "bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
                )}
              >
                {other?.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate">
                {other?.name || "Unknown"}
              </p>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
              {chat.lastMessage?.originalText ? (
                <>
                  <Globe className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                  {chat.lastMessage.originalText}
                </>
              ) : (
                <span className="italic opacity-60">{t("noMessages")}</span>
              )}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
        </Link>
      </motion.div>
    );
  });
}
