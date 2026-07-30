"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-lg",
        color,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-300" />
              <span className="text-green-300 text-sm font-medium">
                {change > 0 ? "+" : ""}
                {change}
              </span>
              {changeLabel && (
                <span className="text-white/60 text-sm">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface StatCardSkeletonProps {
  className?: string;
}

export function AdminStatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse h-32 rounded-2xl",
        className
      )}
    />
  );
}