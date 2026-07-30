"use client";

import { useTranslations } from "next-intl";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/features/landing/components/animations/fade-in";
import { UserPlus, MessageSquare, Languages } from "lucide-react";

const STEP_ICONS = [UserPlus, MessageSquare, Languages];

export function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section id="how-it-works" className="relative w-full py-20 md:py-28 px-4 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("howItWorks.title")}</h2>
            <p className="max-w-[600px] text-muted-foreground text-lg leading-relaxed">{t("howItWorks.subtitle")}</p>
          </div>
        </FadeIn>

        <div className="relative grid gap-8 lg:grid-cols-3">
          <div className="hidden lg:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <StaggerChildren className="contents" staggerDelay={0.15}>
            {[1, 2, 3].map((step, idx) => {
              const Icon = STEP_ICONS[idx];
              return (
                <StaggerItem key={step}>
                  <div className="relative flex flex-col items-center text-center group">
                    <div className="relative mb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                        {step}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{t(`howItWorks.steps.${step}.title`)}</h3>
                    <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{t(`howItWorks.steps.${step}.description`)}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}
