"use client";

import { Skeleton } from "@/components/ui/skeleton";

const skeletonData = [
  { align: "left", width: "w-56", avatar: true },
  { align: "right", width: "w-48", avatar: false },
  { align: "right", width: "w-64", avatar: false },
  { align: "left", width: "w-72", avatar: true },
  { align: "left", width: "w-40", avatar: false },
  { align: "right", width: "w-52", avatar: false },
];

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {skeletonData.map((item, i) => (
        <div
          key={i}
          className={`flex w-full items-end gap-2 ${item.align === "right" ? "justify-end" : "justify-start"}`}
        >
          {item.align === "left" && item.avatar && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          {item.align === "left" && !item.avatar && <div className="w-8 shrink-0" />}
          <div className="space-y-2">
            <Skeleton className={`h-10 rounded-2xl ${item.align === "right" ? "rounded-br-sm" : "rounded-bl-sm"} ${item.width}`} />
            <Skeleton className={`h-3 ${item.align === "right" ? "ml-auto" : ""} w-12 rounded`} />
          </div>
        </div>
      ))}
    </div>
  );
}
