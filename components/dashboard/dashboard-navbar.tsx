"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardNavbarSearch } from "./dashboard-navbar/dashboard-navbar-search";
import { DashboardNavbarActions } from "./dashboard-navbar/dashboard-navbar-actions";

export function DashboardNavbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-16 items-center border-b bg-background/80 backdrop-blur-xl shadow-sm px-4 md:px-6 sticky top-0 z-50"
    >
      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden md:block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            LinguaBridge
          </span>
        </div>
      </div>

      <DashboardNavbarSearch />

      <DashboardNavbarActions />
    </motion.div>
  );
}
