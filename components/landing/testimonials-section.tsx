"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { testimonials } from "@/components/landing/data";

export function TestimonialsSection() {
  const t = useTranslations("Landing");

  return (
    <section id="testimonials" className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Quote className="h-4 w-4" />
            {t("testimonials.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("testimonials.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("testimonials.subtitle")}</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl border border-border/50 bg-card p-7 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-4 text-5xl font-serif text-primary/5 leading-none select-none">&quot;</div>
              <div className="flex gap-1 mb-5">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-7 text-sm">&ldquo;{item.content}&rdquo;</p>
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
