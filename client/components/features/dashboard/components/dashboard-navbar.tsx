"use client";

import { Sparkles } from "lucide-react";
import { DashboardNavbarSearch } from "./dashboard-navbar/dashboard-navbar-search";
import { DashboardNavbarActions } from "./dashboard-navbar/dashboard-navbar-actions";

export function DashboardNavbar() {
  return (
    <div className="flex h-14 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-50">
      <div className="flex-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-semibold text-base hidden md:block">LinguaBridge</span>
      </div>
      <DashboardNavbarSearch />
      <DashboardNavbarActions />
    </div>
  );
}
