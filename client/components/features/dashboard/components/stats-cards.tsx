"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Languages, Mic, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAnalyticsStats } from "./use-analytics-stats";
import { AnimatedNumber } from "./animated-number";

const cardData = [
  { key: "messages" as const, icon: MessageSquare, labelKey: "messagesSent" },
  { key: "translations" as const, icon: Languages, labelKey: "translationsDone" },
  { key: "voiceTranslations" as const, icon: Mic, labelKey: "voiceTranslations" },
];

export function StatsCards() {
  const t = useTranslations("Dashboard");
  const { isLoading, getStatValue, totalAll } = useAnalyticsStats();

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-7 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <AnimatedNumber value={totalAll} />
            )}
          </div>
        </CardContent>
      </Card>

      {cardData.map((card) => {
        const stat = getStatValue(card.key);
        const Icon = card.icon;

        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(card.labelKey)}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <AnimatedNumber value={stat.total} />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                {stat.delta >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.delta >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {stat.delta >= 0 ? "+" : ""}{stat.delta}{card.key === "translations" ? "%" : ""}
                </span>
                <span>{t("thisWeek")}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
