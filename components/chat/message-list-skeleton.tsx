"use client";

import { motion } from "framer-motion";
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
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`flex w-full items-end gap-2 ${item.align === "right" ? "justify-end" : "justify-start"}`}
        >
          {item.align === "left" && item.avatar && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          {item.align === "left" && !item.avatar && <div className="w-8 shrink-0" />}
          <div className="space-y-2">
            <Skeleton className={`h-10 rounded-2xl ${item.align === "right" ? "rounded-br-sm" : "rounded-bl-sm"} ${item.width}`} />
            <Skeleton className={`h-3 ${item.align === "right" ? "ml-auto" : ""} w-12 rounded`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
