"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { Particles } from "@/components/landing/particles";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { stats } from "@/components/landing/data";
import { useTranslations } from "next-intl";
import { motion, MotionValue } from "framer-motion";
import { Sparkles, ChevronRight, Check, Users, Languages, MessageSquare, Globe } from "lucide-react";

interface HeroSectionProps {
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
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
    <section className="relative min-h-screen flex items-center px-4 lg:px-8 overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[5%] left-[10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent rounded-full blur-[100px] animate-[spin_35s_linear_infinite]" />
        <Particles />
      </div>

      <motion.div style={{ opacity: heroOpacity, scale: heroScale } as never} className="w-full">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {t("hero.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
                  {t("hero.title")}
                </span>
              </h1>
              <p className="max-w-[560px] text-muted-foreground text-lg md:text-xl leading-relaxed mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <Link href="/register">
                <Button size="lg" className="h-13 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all rounded-xl">
                  {t("hero.getStarted")}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-13 px-8 text-base rounded-xl">
                  {t("hero.signIn")}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                No credit card
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Free forever tier
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Cancel anytime
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <ChatMockup />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-6 left-0 right-0 mx-auto w-full max-w-5xl px-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border/50 border border-border/50 shadow-lg">
          {stats.map((s) => {
            const Icon = STAT_ICONS[s.label] || Users;
            return (
              <div key={s.label} className="bg-card/80 backdrop-blur-sm px-5 py-4 flex flex-col items-center gap-0.5">
                <Icon className="h-4 w-4 text-primary mb-1" />
                <div className="text-xl sm:text-2xl font-bold">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
