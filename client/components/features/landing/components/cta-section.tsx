"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/features/landing/components/animations/fade-in";

export function CtaSection() {
  const t = useTranslations("Landing");

  return (
    <section className="relative w-full py-20 md:py-28 px-4 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <FadeIn direction="up" delay={0.1}>
          <div className="relative rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-primary/5 p-8 md:p-14 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />

            <div className="relative space-y-6 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                Get Started Free
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("cta.title")}</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">{t("cta.subtitle")}</p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group">
                  {t("cta.signUp")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="relative flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                {t("cta.noCreditCard")}
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Free forever plan
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
