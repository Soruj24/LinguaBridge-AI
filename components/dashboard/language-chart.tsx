"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { languageMap } from "@/lib/languages";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";

type UsageItem = { code: string; count: number };

export function LanguageChart() {
  const t = useTranslations("Dashboard");
  const [items, setItems] = useState<UsageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await axios.get("/api/analytics/language-usage?limit=12");
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
    "#0088FE","#00C49F","#FFBB28","#FF8042","#845EC2","#D65DB1",
    "#FF6F91","#FF9671","#FFC75F","#F9F871","#2A9D8F","#264653"
  ];

  const data = items.map((item) => {
    const englishName = languageMap[item.code] || item.code;
    const label = t(`languages.${englishName}`);
    return { name: label, value: item.count };
  });
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{t('languageUsage')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {!isLoading && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
