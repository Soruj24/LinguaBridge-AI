"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MessageSquare, Users, Settings, Sun, Moon, Sunset } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { AddFriendDialog } from "@/components/add-friend-dialog";

interface QuickAction {
  labelKey: "newChat" | "viewFriends" | "openSettings";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  isDialog?: true;
  gradient: string;
}

const quickActions: QuickAction[] = [
  {
    labelKey: "newChat",
    icon: MessageSquare,
    href: "/",
    gradient: "from-primary to-primary/70",
  },
  {
    labelKey: "viewFriends",
    icon: Users,
    isDialog: true,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    labelKey: "openSettings",
    icon: Settings,
    href: "/settings",
    gradient: "from-blue-500 to-blue-600",
  },
];

function GreetingIcon({ hour }: { hour: number }) {
  if (hour < 12) return <Sun className="h-4 w-4 text-amber-400" />;
  if (hour < 18) return <Sunset className="h-4 w-4 text-orange-400" />;
  return <Moon className="h-4 w-4 text-indigo-400" />;
}

export function WelcomeBanner() {
  const t = useTranslations("Dashboard");
  const { data: session } = useSession();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const firstName = session?.user?.name?.split(" ")[0] || t("defaultUser");
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? t("greeting.morning") : hour < 18 ? t("greeting.afternoon") : t("greeting.evening");

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />
      <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "0.5s" }} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
              <GreetingIcon hour={hour} />
              <span className="font-medium text-primary">{greeting}</span>
            </div>
            <span className="text-muted-foreground/60 hidden sm:inline">&middot;</span>
            <span className="text-muted-foreground/60 text-xs hidden sm:inline">{dateStr}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("welcomeBack", { name: firstName })}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            {t("welcomeSubtitle")}
          </p>
        </div>
        <div className="flex gap-2.5">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.labelKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {action.isDialog ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 bg-background/50 hover:bg-background/80 border-border/50 hover:border-primary/30 transition-all"
                    onClick={() => setShowAddFriend(true)}
                  >
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="hidden sm:inline">{t(action.labelKey)}</span>
                  </Button>
                ) : (
                  <Link href={action.href!}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 bg-background/50 hover:bg-background/80 border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="hidden sm:inline">{t(action.labelKey)}</span>
                    </Button>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} onAdded={() => {}} />
    </motion.div>
  );
}
