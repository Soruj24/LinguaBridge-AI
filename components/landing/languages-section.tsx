"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { languagesList } from "@/components/landing/data";

export function LanguagesSection() {
  const t = useTranslations("Landing");

  return (
    <section className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border px-4 py-1.5 text-sm font-medium text-primary">
            <Globe className="h-4 w-4" />
            {t("languages.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("languages.title")}</h2>
          <p className="max-w-[600px] text-muted-foreground text-lg">{t("languages.subtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
          {languagesList.map((lang) => (
            <div key={lang} className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {lang}
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-muted-foreground">{t("languages.more")}</p>
      </div>
    </section>
  );
}
