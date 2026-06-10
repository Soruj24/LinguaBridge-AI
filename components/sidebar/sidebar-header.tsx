"use client";

import { Link, usePathname } from "@/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  UserPlus,
  Users, 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { NotificationBell } from "@/components/notification-bell";
import { GroupChatDialog } from "@/components/group-chat-dialog";

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenAddFriend: () => void;
  onGroupChatCreated: () => void;
  onClose?: () => void;
}

export function SidebarHeader({
  searchQuery,
  onSearchChange,
  onOpenAddFriend,
  onGroupChatCreated,
  onClose,
}: SidebarHeaderProps) {
  const t = useTranslations("Sidebar");

  return (
    <div className="px-4 pt-4 pb-3 space-y-3 border-b border-border/40 bg-gradient-to-b from-primary/[0.04] to-transparent">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all group-hover:scale-105">
            <MessageSquare className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            LinguaBridge
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <NotificationBell />
          <GroupChatDialog onChatCreated={onGroupChatCreated}>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <Users className="h-4 w-4" />
            </Button>
          </GroupChatDialog>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
            onClick={onOpenAddFriend}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t("search")}
          className="pl-10 h-9 bg-muted/40 border-border/30 focus:border-primary/40 focus:ring-primary/20 rounded-xl text-sm transition-all placeholder:text-muted-foreground/50"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
