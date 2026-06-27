"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Stats {
  messages: { total: number; delta: number };
  translations: { total: number; deltaPercent: number };
  voiceTranslations: { total: number; delta: number };
}

export function useAnalyticsStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await api.get("/api/analytics/stats");
        if (!cancelled) setStats(res.data?.data || null);
      } catch {
        // noop
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const getStatValue = (key: keyof Stats) => {
    const statObj = stats?.[key];
    if (!statObj) return { total: 0, delta: 0 };
    if (key === "translations") return { total: statObj.total, delta: (statObj as { deltaPercent?: number }).deltaPercent ?? 0 };
    return { total: statObj.total, delta: (statObj as { delta?: number }).delta ?? 0 };
  };

  const totalAll = stats
    ? stats.messages.total + stats.translations.total + stats.voiceTranslations.total
    : 0;

  return { stats, isLoading, getStatValue, totalAll };
}
