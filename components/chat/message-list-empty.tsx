"use client";

import { Sparkles, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function MessageListEmpty() {
  const t = useTranslations("Chat");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-1.5">{t("noMessages")}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{t("noMessagesDesc")}</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        {t("aiWillHelp")}
      </div>
    </div>
  );
}
