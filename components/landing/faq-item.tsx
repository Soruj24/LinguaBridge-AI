"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}

export function FaqItem({ q, a, open, onToggle }: FaqItemProps) {
  return (
    <div className="border-b last:border-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}
