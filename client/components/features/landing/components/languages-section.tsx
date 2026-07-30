"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { languagesList } from "@/components/features/landing/components/animations/data";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/features/landing/components/animations/fade-in";

export function LanguagesSection() {
  const t = useTranslations("Landing");

  return (
    <section className="relative w-full py-20 md:py-28 px-4 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Globe className="h-4 w-4" />
              {t("languages.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("languages.title")}</h2>
            <p className="max-w-[600px] text-muted-foreground text-lg leading-relaxed">{t("languages.subtitle")}</p>
          </div>
        </FadeIn>

        <StaggerChildren className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto" staggerDelay={0.03}>
          {languagesList.map((lang) => (
            <StaggerItem key={lang}>
              <div className="group inline-flex items-center gap-2 rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:border-primary/20 hover:text-primary hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                {lang}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <FadeIn delay={0.3}>
          <p className="text-center mt-12 text-sm text-muted-foreground font-medium">{t("languages.more")}</p>
        </FadeIn>
      </div>
    </section>
  );
}
