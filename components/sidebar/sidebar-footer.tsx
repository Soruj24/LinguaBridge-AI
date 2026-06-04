"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogOut, Settings, Globe, UserCog, Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface SidebarFooterProps {
  onOpenLanguageModal: () => void;
}

export function SidebarFooter({ onOpenLanguageModal }: SidebarFooterProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sidebar");
  const tAuth = useTranslations("Auth");

  const userRole = (session?.user as { role?: "user" | "admin" })?.role;

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
          <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
          <p className="text-[11px] text-muted-foreground/70 truncate">{session?.user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 justify-start gap-2 text-xs rounded-lg border-border/40 bg-background/40 hover:bg-muted/50"
          onClick={onOpenLanguageModal}
        >
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          {t("languageRegion")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 justify-start gap-2 text-xs rounded-lg border-border/40 bg-background/40 hover:bg-muted/50"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          {t("settings")}
        </Button>
      </div>

      {userRole === "admin" && (
        <div className="pt-2 border-t border-border/30 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-1">Admin</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 justify-start gap-2 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => router.push(`/${locale}/admin`)}
            >
              <UserCog className="h-3.5 w-3.5" />
              Admin Panel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => router.push(`/${locale}/security`)}
            >
              <Shield className="h-3.5 w-3.5" />
              Security
            </Button>
          </div>
        </div>
      )}

      {userRole !== "admin" && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          onClick={() => router.push(`/${locale}/security`)}
        >
          <Shield className="h-3.5 w-3.5" />
          Security
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full h-8 justify-start gap-2 text-xs rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-3.5 w-3.5" />
        {tAuth("logout")}
      </Button>
    </div>
  );
}
