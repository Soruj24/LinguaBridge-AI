"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRecentConversations } from "./recent-conversations/use-recent-conversations";
import { RecentConversationsList } from "./recent-conversations/recent-conversations-list";

export function RecentConversations() {
  const t = useTranslations("Dashboard");
  const { chats, isLoading, getOtherParticipant, formatTime } =
    useRecentConversations();

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
            <RecentConversationsList
              chats={chats}
              isLoading={isLoading}
              getOtherParticipant={getOtherParticipant}
              formatTime={formatTime}
              t={t}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
