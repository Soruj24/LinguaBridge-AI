"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Languages, Mic, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAnalyticsStats } from "./use-analytics-stats";
import { AnimatedNumber } from "./animated-number";

interface StatCard {
  key: "messages" | "translations" | "voiceTranslations";
  icon: typeof MessageSquare;
  gradient: string;
  labelKey: string;
}

const cardData: StatCard[] = [
  { key: "messages", icon: MessageSquare, gradient: "from-blue-500 to-blue-600", labelKey: "messagesSent" },
  { key: "translations", icon: Languages, gradient: "from-primary/80 to-primary", labelKey: "translationsDone" },
  { key: "voiceTranslations", icon: Mic, gradient: "from-amber-500 to-orange-500", labelKey: "voiceTranslations" },
];

export function StatsCards() {
  const t = useTranslations("Dashboard");
  const { isLoading, getStatValue, totalAll } = useAnalyticsStats();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border bg-gradient-to-br from-primary/10 via-primary/5 to-background h-full shadow-lg">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-primary/15 rounded-full blur-3xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activity</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <AnimatedNumber value={totalAll} />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total interactions this week</p>
          </CardContent>
        </Card>
      </motion.div>

      {cardData.map((card, index) => {
        const stat = getStatValue(card.key);
        const Icon = card.icon;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border bg-background/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-0.5 h-full">
              <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20",
                card.gradient
              )} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(card.labelKey)}
                </CardTitle>
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shadow-lg",
                  `bg-gradient-to-br ${card.gradient}`
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold tracking-tight">
                  {isLoading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <AnimatedNumber value={stat.total} />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  {stat.delta >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className={cn(
                    "font-semibold",
                    stat.delta >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {stat.delta >= 0 ? "+" : ""}{stat.delta}{card.key === "translations" ? "%" : ""}
                  </span>
                  <span className="text-muted-foreground">{t("thisWeek")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
