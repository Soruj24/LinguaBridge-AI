"use client";

import { cn } from "@/lib/utils";
import { Users, UserPlus } from "lucide-react";

interface SidebarTabsProps {
  activeTab: "friends" | "requests";
  onTabChange: (tab: "friends" | "requests") => void;
  totalPending: number;
}

export function SidebarTabs({ activeTab, onTabChange, totalPending }: SidebarTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-border/30">
      <button
        onClick={() => onTabChange("friends")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
          activeTab === "friends"
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <Users className="h-3.5 w-3.5" />
        Friends
      </button>
      <button
        onClick={() => onTabChange("requests")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center relative",
          activeTab === "requests"
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Requests
        {totalPending > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/20">
            {totalPending}
          </span>
        )}
      </button>
    </div>
  );
}
