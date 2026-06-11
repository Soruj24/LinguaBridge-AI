"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartDataItem {
  _id: string;
  count: number;
}

interface AdminAreaChartProps {
  data: ChartDataItem[];
  title: string;
  color?: string;
  className?: string;
}

const COLORS = {
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  red: "#EF4444",
  pink: "#EC4899",
  cyan: "#06B6D4",
};

export function AdminAreaChart({
  data,
  title,
  color = "blue",
  className,
}: AdminAreaChartProps) {
  const chartColor = COLORS[color as keyof typeof COLORS] || COLORS.blue;

  return (
    <div className={cn("bg-card rounded-2xl border p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="h-64">
        {data?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="_id"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={chartColor}
                fill={chartColor}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}