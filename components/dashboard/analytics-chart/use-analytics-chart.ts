"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";

interface DayData {
  name: string;
  messages: number;
}

export function useAnalyticsChart() {
  const t = useTranslations("Dashboard");
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/analytics/stats");
        const stats = res.data?.data;
        if (stats?.dailyActivity) {
          setData(stats.dailyActivity);
        } else {
          setData([
            { name: t("days.Mon"), messages: 120 },
            { name: t("days.Tue"), messages: 150 },
            { name: t("days.Wed"), messages: 180 },
            { name: t("days.Thu"), messages: 140 },
            { name: t("days.Fri"), messages: 200 },
            { name: t("days.Sat"), messages: 170 },
            { name: t("days.Sun"), messages: 190 },
          ]);
        }
      } catch (error) {
        setData([
          { name: t("days.Mon"), messages: 120 },
          { name: t("days.Tue"), messages: 150 },
          { name: t("days.Wed"), messages: 180 },
          { name: t("days.Thu"), messages: 140 },
          { name: t("days.Fri"), messages: 200 },
          { name: t("days.Sat"), messages: 170 },
          { name: t("days.Sun"), messages: 190 },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [t]);

  return { data, isLoading };
}
