"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { languageMap } from "@/lib/languages";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";

type UsageItem = { code: string; count: number };

export function LanguageChart() {
  const t = useTranslations("Dashboard");
  const [items, setItems] = useState<UsageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await axios.get("/api/analytics/language-usage?limit=8");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(data);
      } catch (error) {
        console.error("Failed to load language usage", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const colors = [
    "oklch(0.55 0.18 250)", "oklch(0.6 0.15 200)", "oklch(0.7 0.15 160)", "oklch(0.5 0.12 180)",
    "oklch(0.65 0.18 180)", "oklch(0.75 0.14 140)", "oklch(0.6 0.12 160)", "oklch(0.5 0.15 200)"
  ];

  const data = items.map((item, index) => {
    const englishName = languageMap[item.code] || item.code;
    const label = t(`languages.${englishName}`);
    return { name: label, value: item.count, color: colors[index % colors.length] };
  });

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="h-full bg-background/80 dark:bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            {t("languageUsage")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No language data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!isLoading && data.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {data.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}