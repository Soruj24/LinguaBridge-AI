"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { features } from "@/components/landing/data";

export function FeaturesGridSection() {
  const t = useTranslations("Landing");

  return (
    <section id="features" className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 -z-10" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {t("features.keyFeatures")}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {t("features.title")}
          </h2>
          <p className="max-w-[700px] text-muted-foreground text-lg">{t("features.description")}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
                f.gradient
              )} />
              <div className={cn("inline-flex p-3 rounded-xl bg-gradient-to-br shadow-lg mb-4", f.iconBg)}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2.5 group-hover:text-primary transition-colors">
                {t(`features.cards.${f.titleKey}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`features.cards.${f.titleKey}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
