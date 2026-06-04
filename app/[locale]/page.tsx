"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setShowScrollTop(v > 400);
    setScrolled(v > 50);
  });

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-blue-500 to-primary z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <FeedbackDialog />
      <PageHeader scrolled={scrolled} />

      <main className="flex-1">
        <HeroSection heroOpacity={heroOpacity} heroScale={heroScale} />
        <FeatureDetailSection />
        <FeaturesGridSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <LanguagesSection />

        <section id="pricing" className="w-full py-28 md:py-36 px-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {t("pricing.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("pricing.title")}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t("pricing.subtitle")}</p>
            </motion.div>
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
