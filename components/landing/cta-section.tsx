"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUp, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Landing");

  return (
    <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-primary/12 via-blue-500/10 to-primary/12 rounded-full blur-[150px]" />
      </div>
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-10 md:p-16 text-center shadow-2xl shadow-primary/5"
        >
          <div className="space-y-5 mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("cta.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("cta.subtitle")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-13 px-10 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all rounded-xl">
                {t("cta.signUp")}
                <ArrowUp className="ml-2 h-4 w-4 rotate-45" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            {t("cta.noCreditCard")}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
