"use client";

import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { testimonials } from "@/components/landing/data";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/landing/fade-in";

export function TestimonialsSection() {
  const t = useTranslations("Landing");

  return (
    <section id="testimonials" className="relative w-full py-20 md:py-28 px-4 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Quote className="h-4 w-4" />
              {t("testimonials.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t("testimonials.title")}</h2>
            <p className="max-w-[600px] text-muted-foreground text-lg leading-relaxed">{t("testimonials.subtitle")}</p>
          </div>
        </FadeIn>

        <StaggerChildren className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto" staggerDelay={0.12}>
          {testimonials.map((item) => (
            <StaggerItem key={item.name}>
              <div className="group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 h-full">
                <div className="absolute -top-3 -left-3 h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Quote className="h-4 w-4 text-primary" />
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">&ldquo;{item.content}&rdquo;</p>

                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary border border-primary/10">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
