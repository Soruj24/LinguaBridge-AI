"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { MessageSquare, Users, Settings } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { AddFriendDialog } from "@/components/add-friend-dialog";

const quickActions = [
  { labelKey: "newChat" as const, icon: MessageSquare, href: "/" },
  { labelKey: "viewFriends" as const, icon: Users, isDialog: true },
  { labelKey: "openSettings" as const, icon: Settings, href: "/settings" },
];

export function WelcomeBanner() {
  const t = useTranslations("Dashboard");
  const { data: session } = useSession();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const firstName = session?.user?.name?.split(" ")[0] || t("defaultUser");

  return (
    <div className="rounded-xl border bg-card p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            {t("welcomeBack", { name: firstName })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("welcomeSubtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return action.isDialog ? (
              <Button key={action.labelKey} variant="outline" size="sm" className="gap-2" onClick={() => setShowAddFriend(true)}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(action.labelKey)}</span>
              </Button>
            ) : (
              <Link key={action.labelKey} href={action.href!}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(action.labelKey)}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} onAdded={() => {}} />
    </div>
  );
}
