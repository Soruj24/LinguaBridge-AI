"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

interface DayData {
  name: string;
  messages: number;
}

export function AnalyticsChart() {
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

  const maxValue = Math.max(...data.map((d) => d.messages), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("dailyActivity")}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Messages
            </span>
          </div>
        </CardHeader>
        <CardContent className="pl-0">
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0} />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-slate-700"
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: "#9ca3af" }}
                  domain={[0, maxValue]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#7c3aed" }}
                  labelStyle={{ color: "#6b7280", fontSize: "12px" }}
                  formatter={(value) => [`${value} messages`, "Messages"]}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: "#8b5cf6",
                    strokeWidth: 2,
                    fill: "#fff",
                    filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}