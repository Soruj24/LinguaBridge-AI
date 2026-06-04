"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { faqItems } from "@/components/landing/data";
import { FaqItem } from "@/components/landing/faq-item";

export function FaqSection() {
  const t = useTranslations("Landing");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent -z-10" />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4 mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("faq.title")}</h2>
          <p className="max-w-[500px] text-muted-foreground">{t("faq.subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm px-6"
        >
          {faqItems.map((item, i) => (
            <FaqItem
              key={i}
              q={t(item.qKey)}
              a={t(item.aKey)}
              open={faqOpen === i}
              onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
