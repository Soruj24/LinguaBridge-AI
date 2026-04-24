"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Languages, Mic, TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Stats {
  messages: { total: number; delta: number };
  translations: { total: number; deltaPercent: number };
  voiceTranslations: { total: number; delta: number };
}

const cardData = [
  { key: "messages", icon: MessageSquare, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500", labelKey: "messagesSent" },
  { key: "translations", icon: Languages, color: "from-primary/80 to-primary", bgColor: "bg-primary", labelKey: "translationsDone" },
  { key: "voiceTranslations", icon: Mic, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500", labelKey: "voiceTranslations" },
];

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function StatsCards() {
  const t = useTranslations("Dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get("/api/analytics/stats");
        setStats(res.data?.data || null);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const getStatValue = (key: keyof Stats) => {
    const statObj = stats?.[key];
    if (!statObj) return { total: 0, delta: 0 };
    if (key === "translations") return { total: statObj.total, delta: (statObj as { deltaPercent?: number }).deltaPercent ?? 0 };
    return { total: statObj.total, delta: (statObj as { delta?: number }).delta ?? 0 };
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cardData.map((card, index) => {
        const statKey = card.key as keyof Stats;
        const stat = getStatValue(statKey);
        const Icon = card.icon;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border bg-background/80 dark:bg-background/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              {/* Gradient orb background */}
              <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-15 blur-2xl transition-transform group-hover:scale-150 group-hover:opacity-25",
                card.color.replace("from-", "bg-").replace(" to-", " ")
              )} />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(card.labelKey)}
                </CardTitle>
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20",
                  `bg-gradient-to-br ${card.color} text-white`
                )}>
                  <Icon className="h-5 w-5" />
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
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {stat.delta >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.delta >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {stat.delta >= 0 ? "+" : ""}{stat.delta}
                  </span>
                  <span className="text-muted-foreground">
                    {card.key === "translations" ? "%" : ""} {t("thisWeek")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}