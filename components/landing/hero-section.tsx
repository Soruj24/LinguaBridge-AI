"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { stats } from "@/components/landing/data";
import { useTranslations } from "next-intl";
import { Users, Languages, MessageSquare, Globe } from "lucide-react";

interface HeroSectionProps {
  heroOpacity: unknown;
  heroScale: unknown;
}

const STAT_ICONS: Record<string, typeof Users> = {
  "Active Users": Users,
  "Languages Supported": Languages,
  "Messages Translated": MessageSquare,
  "Countries Reached": Globe,
};

export function HeroSection({ heroOpacity, heroScale }: HeroSectionProps) {
  const t = useTranslations("Landing");

  return (
    <section className="min-h-[90vh] flex items-center px-4 lg:px-8 pt-20">
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12">
          <div className="space-y-6 text-center lg:text-left">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                {t("hero.title")}
              </h1>
              <p className="max-w-[560px] text-muted-foreground text-lg mt-4 mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/register">
                <Button size="lg" className="px-8 text-base">
                  {t("hero.getStarted")}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  {t("hero.signIn")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <ChatMockup />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border">
          {stats.map((s) => {
            const Icon = STAT_ICONS[s.label] || Users;
            return (
              <div key={s.label} className="bg-card px-4 py-3 flex flex-col items-center gap-0.5">
                <Icon className="h-4 w-4 text-primary mb-0.5" />
                <div className="text-xl font-bold">{s.value.toLocaleString()}{s.suffix}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
