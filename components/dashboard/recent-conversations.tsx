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
import { MessageCircle, ArrowRight } from "lucide-react";

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
      <Card className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-violet-500" />
            {t("recentConversations")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              ))
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <MessageCircle className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{t("noConversations")}</p>
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
                      key={chat._id} 
                      href={`/chat/${chat._id}`} 
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group border border-transparent hover:border-violet-200 dark:hover:border-violet-800/30"
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-transparent group-hover:border-violet-300 dark:group-hover:border-violet-600 transition-colors">
                          <AvatarImage src={other?.avatar} alt={other?.name} />
                          <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-medium">
                            {other?.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{other?.name}</p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {chat.lastMessage?.originalText || (
                            <span className="italic opacity-60">{t("noMessages")}</span>
                          )}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
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