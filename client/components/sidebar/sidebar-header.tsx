"use client";

import { Link, usePathname } from "@/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { NotificationBell } from "@/components/notification-bell";
import { GroupChatDialog } from "@/components/group-chat-dialog";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenAddFriend: () => void;
  onGroupChatCreated: () => void;
  onClose?: () => void;
  activeTab: "chats" | "friends" | "requests";
  onTabChange: (tab: "chats" | "friends" | "requests") => void;
  totalPending: number;
}

export function SidebarHeader({
  searchQuery,
  onSearchChange,
  onOpenAddFriend,
  onGroupChatCreated,
  onClose,
  activeTab,
  onTabChange,
  totalPending,
}: SidebarHeaderProps) {
  const t = useTranslations("Sidebar");

  return (
    <div className="px-4 pt-4 pb-3 space-y-3 border-b">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-base">LinguaBridge</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <GroupChatDialog onChatCreated={onGroupChatCreated}>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
              <Users className="h-4 w-4" />
            </Button>
          </GroupChatDialog>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={onOpenAddFriend}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => onTabChange("friends")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center",
            activeTab === "friends"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UserRound className="h-3.5 w-3.5" />
          Friends
        </button>
        <button
          onClick={() => onTabChange("requests")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center",
            activeTab === "requests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Requests
          {totalPending > 0 && (
            <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {totalPending}
            </span>
          )}
        </button>
      </div>

      {activeTab === "friends" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="pl-9 h-9 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
