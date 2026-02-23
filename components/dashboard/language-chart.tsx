"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslations } from "next-intl";

export function LanguageChart() {
  const t = useTranslations('Dashboard');

  const data = [
    { name: t('languages.English'), value: 400 },
    { name: t('languages.Spanish'), value: 300 },
    { name: t('languages.French'), value: 300 },
    { name: t('languages.German'), value: 200 },
  ];
  
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
                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
