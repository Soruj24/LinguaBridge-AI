"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton() {
  return (
    <div className="space-y-1 pt-2 px-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className={cn("h-10 w-10 rounded-full shrink-0", i % 2 ? "bg-muted/40" : "bg-muted/60")} />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className={cn("h-3.5 rounded-md", i % 2 ? "w-28" : "w-36")} />
            <Skeleton className={cn("h-3 rounded-md", i % 2 ? "w-44" : "w-36")} />
          </div>
        </div>
      ))}
    </div>
  );
}
