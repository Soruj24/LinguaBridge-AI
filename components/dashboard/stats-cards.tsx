"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Languages, Mic } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";

export function StatsCards() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const [stats, setStats] = useState<{
    messages: { total: number; delta: number };
    translations: { total: number; deltaPercent: number };
    voiceTranslations: { total: number; delta: number };
  } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get("/api/analytics/stats");
        setStats(res.data?.data || null);
      } catch (error) {
        console.error("Failed to load stats", error);
        setStats(null);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("messagesSent")}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? stats.messages.total.toLocaleString() : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats
              ? `${stats.messages.delta >= 0 ? "+" : ""}${stats.messages.delta} ${t("fromLastWeek")}`
              : tCommon("loading")}
          </p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("translationsDone")}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? stats.translations.total.toLocaleString() : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats
              ? `${stats.translations.deltaPercent >= 0 ? "+" : ""}${stats.translations.deltaPercent}% ${t("increase")}`
              : tCommon("loading")}
          </p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("voiceTranslations")}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
            <Mic className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats ? stats.voiceTranslations.total.toLocaleString() : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats
              ? `${stats.voiceTranslations.delta >= 0 ? "+" : ""}${stats.voiceTranslations.delta} ${t("thisWeek")}`
              : tCommon("loading")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
