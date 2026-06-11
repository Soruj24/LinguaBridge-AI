"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { PricingPlans } from "@/components/subscription/pricing-plans";
import {
  PageHeader,
  HeroSection,
  FeatureDetailSection,
  FeaturesGridSection,
  HowItWorksSection,
  StatsSection,
  TestimonialsSection,
  LanguagesSection,
  FaqSection,
  CtaSection,
  FooterSection,
} from "@/components/landing";

export default function Home() {
  const t = useTranslations("Landing");
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    const onScroll = () => setScrolled(window.scrollY > 50);
    if (!scrolled && window.scrollY > 50) setScrolled(true);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <FeedbackDialog />
      <PageHeader scrolled={scrolled} />

      <main className="flex-1">
        <HeroSection />
        <FeatureDetailSection />
        <FeaturesGridSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <LanguagesSection />

        <section id="pricing" className="w-full py-20 md:py-28 px-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {t("pricing.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("pricing.title")}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t("pricing.subtitle")}</p>
            </div>
            <PricingPlans />
          </div>
        </section>

        <FaqSection />
        <CtaSection />
      </main>

      <FooterSection />
    </div>
  );
}
