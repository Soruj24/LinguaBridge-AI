"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TrendingUp } from "lucide-react";
import { useAnalyticsChart } from "./analytics-chart/use-analytics-chart";

export function AnalyticsChart() {
  const t = useTranslations("Dashboard");
  const { data, isLoading } = useAnalyticsChart();
  const maxValue = Math.max(...data.map((d) => d.messages), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="h-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("dailyActivity")}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Messages
            </span>
          </div>
        </CardHeader>
        <CardContent className="pl-0">
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">
                  Loading...
                </span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id="colorMessages"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  opacity={0.6}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  opacity={0.6}
                  domain={[0, maxValue]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  }}
                  itemStyle={{ color: "var(--primary)" }}
                  labelStyle={{
                    color: "var(--muted-foreground)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} messages`, "Messages"]}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: "var(--primary)",
                    strokeWidth: 2,
                    fill: "var(--card)",
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
