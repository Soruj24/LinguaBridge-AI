"use client";

import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface SidebarFooterProps {
  onOpenLanguageModal: () => void;
}

export function SidebarFooter({ onOpenLanguageModal }: SidebarFooterProps) {
  const { data: session } = useSession();

  return (
    <div className="border-t border-border/40 bg-gradient-to-t from-background/80 to-background/30 backdrop-blur-sm p-3 space-y-3">
      <div className="flex items-center gap-3 px-1">
        <Avatar className="h-9 w-9 ring-2 ring-primary/10">
          <AvatarImage src={session?.user?.image || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
            {session?.user?.name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {session?.user?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
