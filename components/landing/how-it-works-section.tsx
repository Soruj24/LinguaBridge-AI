"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section id="how-it-works" className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("howItWorks.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("howItWorks.subtitle")}</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step * 0.15, duration: 0.6 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="relative mb-7">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-2xl shadow-primary/25 relative z-10">
                    {step}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl scale-125" />
                </div>
                <h3 className="text-xl font-bold mb-3.5">{t(`howItWorks.steps.${step}.title`)}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">{t(`howItWorks.steps.${step}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
