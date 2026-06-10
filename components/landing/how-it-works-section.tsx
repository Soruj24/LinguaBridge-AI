"use client";

import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("howItWorks.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary mb-4">
                {step}
              </div>
              <h3 className="text-lg font-bold mb-2">{t(`howItWorks.steps.${step}.title`)}</h3>
              <p className="text-muted-foreground text-sm max-w-xs">{t(`howItWorks.steps.${step}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
