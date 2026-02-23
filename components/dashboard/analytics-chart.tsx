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

export function AnalyticsChart() {
  const t = useTranslations('Dashboard');
  
  const data = [
    { name: t('days.Mon'), messages: 120 },
    { name: t('days.Tue'), messages: 150 },
    { name: t('days.Wed'), messages: 180 },
    { name: t('days.Thu'), messages: 140 },
    { name: t('days.Fri'), messages: 200 },
    { name: t('days.Sat'), messages: 170 },
    { name: t('days.Sun'), messages: 190 },
  ];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{t('dailyActivity')}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="messages" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorMessages)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
