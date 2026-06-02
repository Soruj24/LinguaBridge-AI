"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MessageSquare, Users, Settings, Sparkles } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    labelKey: "newChat",
    icon: MessageSquare,
    href: "/",
    color: "from-primary to-primary/70",
  },
  {
    labelKey: "viewFriends",
    icon: Users,
    href: "/settings",
    color: "from-amber-500 to-orange-500",
  },
  {
    labelKey: "openSettings",
    icon: Settings,
    href: "/settings",
    color: "from-blue-500 to-blue-600",
  },
];

export function WelcomeBanner() {
  const t = useTranslations("Dashboard");
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || t("defaultUser");
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? t("greeting.morning") : hour < 18 ? t("greeting.afternoon") : t("greeting.evening");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{greeting}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("welcomeBack", { name: firstName })}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            {t("welcomeSubtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.labelKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={action.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 bg-background/50 hover:bg-background/80 border-muted-foreground/20"
                  >
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="hidden sm:inline">{t(action.labelKey)}</span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
