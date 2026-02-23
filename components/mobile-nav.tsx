"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide on chat routes to give full screen space
  if (pathname?.startsWith("/chat/")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors p-2 rounded-lg",
            pathname === "/dashboard"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium transition-colors p-2 rounded-lg",
                pathname === "/chat" || pathname?.startsWith("/chat")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              Chats
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r-0">
            <Sidebar className="w-full h-full border-none shadow-none" onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1 text-xs font-medium transition-colors p-2 rounded-lg",
            pathname === "/settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
