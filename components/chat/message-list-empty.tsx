"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function MessageListEmpty() {
  const t = useTranslations("Chat");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center backdrop-blur-sm">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
      </motion.div>
      <h3 className="font-semibold text-lg text-foreground mb-1.5">{t("noMessages")}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{t("noMessagesDesc")}</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        {t("aiWillHelp")}
      </div>
    </motion.div>
  );
}
