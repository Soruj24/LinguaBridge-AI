"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { FadeIn } from "@/components/landing/fade-in";
import { stats } from "@/components/landing/data";
import { useTranslations } from "next-intl";
import { Users, Languages, MessageSquare, Globe, ArrowRight } from "lucide-react";

const STAT_ICONS: Record<string, typeof Users> = {
  "Active Users": Users,
  "Languages Supported": Languages,
  "Messages Translated": MessageSquare,
  "Countries Reached": Globe,
};

export function HeroSection() {
  const t = useTranslations("Landing");

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 lg:px-8 pt-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] animate-[float_6s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12">
          <div className="space-y-8 text-center lg:text-left">
            <FadeIn delay={0.1} direction="up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                AI-Powered Translation Platform
              </div>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
                  {t("hero.title")}
                </h1>
                <p className="max-w-[560px] text-muted-foreground text-lg md:text-xl mt-6 mx-auto lg:mx-0 leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group">
                    {t("hero.getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-8 text-base backdrop-blur-sm">
                    {t("hero.signIn")}
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>50K+ users</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} direction="right" className="hidden lg:block">
            <ChatMockup />
          </FadeIn>
        </div>

        <FadeIn delay={0.5} direction="up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border bg-border/50 shadow-xl shadow-black/5">
            {stats.map((s) => {
              const Icon = STAT_ICONS[s.label] || Users;
              return (
                <div key={s.label} className="bg-card/80 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1 hover:bg-card transition-colors duration-300">
                  <Icon className="h-5 w-5 text-primary mb-1" />
                  <div className="text-2xl font-bold">{s.value.toLocaleString()}{s.suffix}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
