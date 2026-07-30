"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/utils";

interface LanguageDataItem {
  _id: string;
  count: number;
}

interface AdminPieChartProps {
  data: LanguageDataItem[];
  title?: string;
  className?: string;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

export function AdminPieChart({ data, title, className }: AdminPieChartProps) {
  const maxCount = data?.[0]?.count || 1;

  return (
    <div className={cn("bg-card rounded-2xl border p-6", className)}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="h-64">
        {data?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {data?.map((item, index) => (
          <div key={item._id} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>
              {item._id || "Unknown"} ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminLanguageBarProps {
  data: LanguageDataItem[];
  className?: string;
}

export function AdminLanguageBar({ data, className }: AdminLanguageBarProps) {
  const maxCount = data?.[0]?.count || 1;

  return (
    <div className={cn("space-y-2", className)}>
      {data?.map((lang, index) => (
        <div key={lang._id || index} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{lang._id || "Unknown"}</span>
              <span className="text-muted-foreground">{lang.count}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(lang.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}