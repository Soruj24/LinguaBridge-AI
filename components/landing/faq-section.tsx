"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { faqItems } from "@/components/landing/data";
import { FaqItem } from "@/components/landing/faq-item";

export function FaqSection() {
  const t = useTranslations("Landing");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("faq.title")}</h2>
          <p className="max-w-[500px] text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        <div className="rounded-xl border px-5">
          {faqItems.map((item, i) => (
            <FaqItem
              key={i}
              q={t(item.qKey)}
              a={t(item.aKey)}
              open={faqOpen === i}
              onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
