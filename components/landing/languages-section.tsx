"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { languagesList } from "@/components/landing/data";

export function LanguagesSection() {
  const t = useTranslations("Landing");

  return (
    <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 -z-10" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Globe className="h-4 w-4" />
            {t("languages.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("languages.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("languages.subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto"
        >
          {languagesList.map((lang, i) => (
            <motion.div
              key={lang}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.015, duration: 0.25 }}
              whileHover={{ scale: 1.06, y: -3 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-default shadow-sm"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {lang}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          {t("languages.more")}
        </motion.p>
      </div>
    </section>
  );
}
