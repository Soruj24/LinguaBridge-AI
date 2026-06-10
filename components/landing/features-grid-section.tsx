"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { features } from "@/components/landing/data";

export function FeaturesGridSection() {
  const t = useTranslations("Landing");

  return (
    <section id="features" className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {t("features.keyFeatures")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("features.title")}</h2>
          <p className="max-w-[700px] text-muted-foreground text-lg">{t("features.description")}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((f) => (
            <div key={f.titleKey} className="rounded-xl border bg-card p-5">
              <div className="inline-flex p-2.5 rounded-lg bg-primary/10 mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t(`features.cards.${f.titleKey}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`features.cards.${f.titleKey}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
