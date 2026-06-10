"use client";

import { Link, usePathname } from "@/navigation";
import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface TabBase {
  labelKey: "dashboard" | "chats" | "settings";
  icon: React.ComponentType<{ className?: string }>;
}

interface TabLink extends TabBase {
  href: string;
  isSheet: false;
}

interface TabSheet extends TabBase {
  isSheet: true;
}

type Tab = TabLink | TabSheet;

const tabs: Tab[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, isSheet: false },
  { labelKey: "chats", icon: MessageSquare, isSheet: true },
  { href: "/settings", labelKey: "settings", icon: Settings, isSheet: false },
];

function TabButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all p-1.5 rounded-xl min-w-[4rem]",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
          isActive
            ? "bg-primary/10 shadow-sm"
            : "hover:bg-muted/50",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span>{label}</span>
    </button>
  );
}

export function MobileNav() {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/chat/")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 px-4">
        {tabs.map((tab) => {
          if (tab.isSheet) {
            const isActive = pathname?.startsWith("/chat");
            return (
              <Sheet key="chats" open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <span>
                    <TabButton
                      icon={tab.icon}
                      label={t(tab.labelKey)}
                      isActive={!!isActive}
                    />
                  </span>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="p-0 w-80 border-r border-border/40"
                >
                  <Sidebar
                    className="w-full h-full border-none shadow-none"
                    onClose={() => setOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            );
          }

          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}>
              <TabButton
                icon={tab.icon}
                label={t(tab.labelKey)}
                isActive={isActive}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
