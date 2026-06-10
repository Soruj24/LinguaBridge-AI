"use client";

import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { testimonials } from "@/components/landing/data";

export function TestimonialsSection() {
  const t = useTranslations("Landing");

  return (
    <section id="testimonials" className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border px-4 py-1.5 text-sm font-medium text-primary">
            <Quote className="h-4 w-4" />
            {t("testimonials.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("testimonials.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("testimonials.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-xl border bg-card p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-5 text-sm">&ldquo;{item.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
