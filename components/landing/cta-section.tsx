"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Landing");

  return (
    <section className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border bg-card p-8 md:p-12 text-center">
          <div className="space-y-4 mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("cta.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("cta.subtitle")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8 text-base">
                {t("cta.signUp")}
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            {t("cta.noCreditCard")}
          </div>
        </div>
      </div>
    </section>
  );
}
