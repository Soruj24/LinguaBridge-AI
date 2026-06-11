"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { features } from "@/components/landing/data";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/landing/fade-in";

const GRADIENT_MAP: Record<string, string> = {
  "from-blue-500/20 to-blue-600/5": "from-blue-500 to-blue-600",
  "from-purple-500/20 to-purple-600/5": "from-purple-500 to-purple-600",
  "from-emerald-500/20 to-emerald-600/5": "from-emerald-500 to-emerald-600",
  "from-amber-500/20 to-amber-600/5": "from-amber-500 to-amber-600",
  "from-rose-500/20 to-rose-600/5": "from-rose-500 to-rose-600",
  "from-cyan-500/20 to-cyan-600/5": "from-cyan-500 to-cyan-600",
};

export function FeaturesGridSection() {
  const t = useTranslations("Landing");

  return (
    <section id="features" className="relative w-full py-20 md:py-28 px-4 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {t("features.keyFeatures")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("features.title")}</h2>
            <p className="max-w-[700px] text-muted-foreground text-lg leading-relaxed">{t("features.description")}</p>
          </div>
        </FadeIn>

        <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" staggerDelay={0.08}>
          {features.map((f) => {
            const iconGradient = GRADIENT_MAP[f.gradient] || "from-primary to-primary";
            return (
              <StaggerItem key={f.titleKey}>
                <div className="group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 h-full">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg shadow-primary/10 mb-4`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(`features.cards.${f.titleKey}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.cards.${f.titleKey}.description`)}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
