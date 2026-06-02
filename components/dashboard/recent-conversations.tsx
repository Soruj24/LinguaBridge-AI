"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Globe } from "lucide-react";
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

export function RecentConversations() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await axios.get("/api/chat");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const sorted = data.sort((a: Chat, b: Chat) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setChats(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (session?.user) {
      fetchChats();
    }
  }, [session]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.email !== session?.user?.email);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / 86400000);

    if (diffDays === 0) {
      return msgDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return msgDate.toLocaleDateString(locale, { weekday: "short" });
    } else {
      return msgDate.toLocaleDateString(locale, { month: "short", day: "numeric" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="h-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {t("recentConversations")}
          </CardTitle>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            {isLoading ? "..." : `${chats.length} chats`}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[160px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </div>
              ))
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 shadow-inner">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{t("noConversations")}</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Start a new conversation to see it here
                </p>
              </div>
            ) : (
              chats.map((chat, index) => {
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
                          <AvatarFallback className={cn(
                            "font-medium text-sm",
                            "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                          )}>
                            {other?.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{other?.name || "Unknown"}</p>
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
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
