"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Globe,
  Mic,
  ShieldCheck,
  Zap,
  Users,
  ArrowUp,
  Star,
  Check,
  ChevronRight,
  Languages,
  Sparkles,
  Quote,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { PricingPlans } from "@/components/subscription/pricing-plans";
import { cn } from "@/lib/utils";

/* ---------- reusable hooks ---------- */

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); o.disconnect(); } },
      { threshold }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedCounter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);
  const id = useRef<number>(undefined);
  useEffect(() => {
    if (!inView) return;
    let start: number;
    const fn = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / (duration * 1000), 1);
      setCount(Math.floor(p * end));
      if (p < 1) id.current = requestAnimationFrame(fn);
    };
    id.current = requestAnimationFrame(fn);
    return () => { if (id.current) cancelAnimationFrame(id.current); };
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ---------- static data ---------- */

const stats = [
  { label: "Active Users", value: 50000, suffix: "+", icon: Users },
  { label: "Languages Supported", value: 50, suffix: "+", icon: Languages },
  { label: "Messages Translated", value: 10, suffix: "M+", icon: MessageSquare },
  { label: "Countries Reached", value: 180, suffix: "+", icon: Globe },
];

const features = [
  {
    icon: MessageSquare, titleKey: "chat",
    gradient: "from-blue-500/20 to-blue-600/5", iconBg: "from-blue-500 to-blue-600",
  },
  {
    icon: Mic, titleKey: "voice",
    gradient: "from-purple-500/20 to-purple-600/5", iconBg: "from-purple-500 to-purple-600",
  },
  {
    icon: Globe, titleKey: "autoDetect",
    gradient: "from-emerald-500/20 to-emerald-600/5", iconBg: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users, titleKey: "globalConnect",
    gradient: "from-amber-500/20 to-amber-600/5", iconBg: "from-amber-500 to-amber-600",
  },
  {
    icon: Zap, titleKey: "lightningFast",
    gradient: "from-rose-500/20 to-rose-600/5", iconBg: "from-rose-500 to-rose-600",
  },
  {
    icon: ShieldCheck, titleKey: "secure",
    gradient: "from-cyan-500/20 to-cyan-600/5", iconBg: "from-cyan-500 to-cyan-600",
  },
];

const testimonials = [
  {
    name: "Sarah Chen", role: "International Business Consultant", avatar: "SC",
    content: "LinguaBridge has transformed how I communicate with clients across Asia. The real-time translation is incredibly accurate and natural-sounding.",
    rating: 5,
  },
  {
    name: "Marco Rossi", role: "Travel Blogger", avatar: "MR",
    content: "I travel to 20+ countries yearly and this app is a lifesaver. The voice translation feature helps me navigate conversations effortlessly.",
    rating: 5,
  },
  {
    name: "Aisha Patel", role: "Language Educator", avatar: "AP",
    content: "As a language teacher, I recommend LinguaBridge to all my students. It bridges the gap between learning and real-world communication.",
    rating: 5,
  },
];

const languages = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese",
  "Korean", "Russian", "Portuguese", "Italian", "Arabic", "Hindi",
  "Bengali", "Turkish", "Dutch", "Polish", "Vietnamese", "Thai",
  "Swedish", "Greek", "Hebrew", "Czech", "Romanian", "Ukrainian",
  "Hungarian", "Finnish", "Danish", "Norwegian", "Malay", "Tamil",
  "Telugu", "Urdu", "Persian", "Swahili", "Punjabi", "Gujarati",
];

const faqItems = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
];

/* ---------- sub-components ---------- */

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ChatMockup() {
  const messages = [
    { side: "left", text: "¡Hola! ¿Cómo estás?", translation: "Hello! How are you?", time: "2 min ago" },
    { side: "right", text: "I'm great! Thanks for asking.", translation: "¡Estoy genial! Gracias por preguntar.", time: "1 min ago" },
    { side: "left", text: "¿Te gustaría practicar español conmigo?", translation: "Would you like to practice Spanish with me?", time: "Just now" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-full max-w-[380px] mx-auto"
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
        {/* device bar */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        {/* header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 pb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-primary-foreground">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Chat with Maria</p>
            <p className="text-[11px] text-emerald-500 font-medium">● Online</p>
          </div>
          <div className="flex -space-x-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {/* messages */}
        <div className="space-y-3 px-4 py-4 min-h-[240px]">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.side === "left" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
              className={cn("flex", msg.side === "left" ? "justify-start" : "justify-end")}
            >
              <div className={cn(
                "max-w-[85%] space-y-1",
                msg.side === "left" ? "items-start" : "items-end"
              )}>
                <div className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  msg.side === "left"
                    ? "bg-muted/80 text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}>
                  {msg.text}
                </div>
                <div className={cn(
                  "rounded-2xl px-3.5 py-1.5 text-xs italic leading-relaxed",
                  msg.side === "left"
                    ? "bg-primary/10 text-primary/80 rounded-bl-sm"
                    : "bg-primary/20 text-primary-foreground/80 rounded-br-sm"
                )}>
                  <Sparkles className="inline h-3 w-3 mr-1 align-text-top" />
                  {msg.translation}
                </div>
                <p className="text-[10px] text-muted-foreground/60 px-1">{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
        {/* input bar */}
        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <span className="text-xs text-muted-foreground flex-1">Type a message...</span>
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <ArrowUp className="h-3 w-3 text-primary-foreground rotate-45" />
            </div>
          </div>
        </div>
      </div>
      {/* glow */}
      <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent rounded-3xl blur-3xl" />
    </motion.div>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-foreground"
      >
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{q}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground/80 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- page ---------- */

export default function Home() {
  const t = useTranslations('Landing');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useMotionValueEvent(scrollY, "change", (v) => {
    setShowScrollTop(v > 400);
    setScrolled(v > 50);
  });

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-blue-500 to-primary z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <FeedbackDialog />

      {/* ===== Header ===== */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl flex h-16 items-center px-4 lg:px-8">
          <Link className="flex items-center gap-2 group" href="/">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Globe className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              LinguaBridge AI
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            {[
              { href: "#features", label: t('header.features') },
              { href: "#testimonials", label: t('header.testimonials') },
              { href: "#pricing", label: t('header.pricing') },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  {t('header.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-medium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  {t('header.getStarted')}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ===== Hero ===== */}
        <section className="relative min-h-screen flex items-center px-4 lg:px-8 overflow-hidden pt-20">
          {/* ambient bg */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[5%] left-[10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent rounded-full blur-[100px] animate-[spin_35s_linear_infinite]" />
            <Particles />
          </div>

          <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="w-full">
            <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* left – text */}
              <div className="space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    {t('hero.badge')}
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
                      {t('hero.title')}
                    </span>
                  </h1>

                  <p className="max-w-[560px] text-muted-foreground text-lg md:text-xl leading-relaxed mx-auto lg:mx-0">
                    {t('hero.subtitle')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-3"
                >
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="h-13 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all rounded-xl"
                    >
                      {t('hero.getStarted')}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="h-13 px-8 text-base rounded-xl">
                      {t('hero.signIn')}
                    </Button>
                  </Link>
                </motion.div>

                {/* trust line */}
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

              {/* right – mockup */}
              <div className="hidden lg:block">
                <ChatMockup />
              </div>
            </div>
          </motion.div>

          {/* stats bar – bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute bottom-6 left-0 right-0 mx-auto w-full max-w-5xl px-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border/50 border border-border/50 shadow-lg">
              {stats.map((s) => (
                <div key={s.label} className="bg-card/80 backdrop-blur-sm px-5 py-4 flex flex-col items-center gap-0.5">
                  <s.icon className="h-4 w-4 text-primary mb-1" />
                  <div className="text-xl sm:text-2xl font-bold">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ===== Feature detail – alternating ===== */}
        <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent -z-10" />
          <div className="mx-auto max-w-7xl space-y-28 md:space-y-36">
            {[
              { icon: MessageSquare, title: "Real‑time Translation", desc: "Messages are translated in milliseconds as they arrive. Your conversation flows naturally, just like speaking the same language.", accent: "from-blue-500 to-blue-600", side: "left" as const },
              { icon: Mic, title: "Voice & Speech Translation", desc: "Speak in your native language and your voice is transcribed, translated, and synthesized into the target language — preserving tone and emotion.", accent: "from-purple-500 to-purple-600", side: "right" as const },
              { icon: ShieldCheck, title: "Enterprise‑Grade Security", desc: "End‑to‑end encryption ensures your conversations stay private. We never store or train on your translated content.", accent: "from-cyan-500 to-cyan-600", side: "left" as const },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className={cn(
                  "grid md:grid-cols-2 gap-10 md:gap-16 items-center",
                  item.side === "right" && "direction-rtl [&>*]:[direction:ltr]"
                )}
              >
                <div className={cn("space-y-5", item.side === "right" && "md:order-2")}>
                  <div className={cn("inline-flex p-3 rounded-2xl bg-gradient-to-br shadow-xl", item.accent)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md">{item.desc}</p>
                  <Link href="/register">
                    <Button variant="link" className="px-0 text-primary gap-1">
                      Learn more <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className={cn("relative", item.side === "right" && "md:order-1")}>
                  <div className="aspect-[4/3] rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 flex items-center justify-center shadow-xl">
                    <div className={cn("h-20 w-20 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center", item.accent)}>
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className={cn("absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-30", item.accent)} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== Features Grid ===== */}
        <section id="features" className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 -z-10" />
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {t('features.keyFeatures')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                {t('features.title')}
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-lg">{t('features.description')}</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <motion.div
                  key={f.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
                    f.gradient
                  )} />
                  <div className={cn(
                    "inline-flex p-3 rounded-xl bg-gradient-to-br shadow-lg mb-4",
                    f.iconBg
                  )}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2.5 group-hover:text-primary transition-colors">
                    {t(`features.cards.${f.titleKey}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`features.cards.${f.titleKey}.description`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section id="how-it-works" className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('howItWorks.title')}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t('howItWorks.subtitle')}</p>
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

        {/* ===== Stats ===== */}
        <section className="w-full py-24 md:py-32 px-4 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-blue-500/8 to-primary/8 -z-10" />
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold tracking-tight">
                    <AnimatedCounter end={s.value} suffix={s.suffix} duration={2.5} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials ===== */}
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
                {t('testimonials.badge')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('testimonials.title')}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t('testimonials.subtitle')}</p>
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

        {/* ===== Languages ===== */}
        <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 -z-10" />
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Globe className="h-4 w-4" />
                {t('languages.badge')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('languages.title')}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t('languages.subtitle')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto"
            >
              {languages.map((lang, i) => (
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.015, duration: 0.25 }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-default shadow-sm"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {lang}
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12 text-sm text-muted-foreground"
            >
              {t('languages.more')}
            </motion.p>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="w-full py-28 md:py-36 px-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {t('pricing.badge')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('pricing.title')}</h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">{t('pricing.subtitle')}</p>
            </motion.div>
            <PricingPlans />
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent -z-10" />
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('faq.title')}</h2>
              <p className="max-w-[500px] text-muted-foreground">{t('faq.subtitle')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm px-6"
            >
              {faqItems.map((item, i) => (
                <FaqItem
                  key={i}
                  q={t(item.qKey)}
                  a={t(item.aKey)}
                  open={faqOpen === i}
                  onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== CTA ===== */}
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('cta.title')}</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t('cta.subtitle')}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-13 px-10 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all rounded-xl"
                  >
                    {t('cta.signUp')}
                    <ArrowUp className="ml-2 h-4 w-4 rotate-45" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                {t('cta.noCreditCard')}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Globe className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">LinguaBridge AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t('footer.description')}</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t('footer.product')}</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('header.features')}</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('header.pricing')}</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('header.login')}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t('footer.company')}</h4>
              <ul className="space-y-3">
                <li><Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('about.title')}</Link></li>
                <li><Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('header.testimonials')}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t('footer.legal')}</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t('footer.terms')}</span></li>
                <li><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t('footer.privacy')}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LinguaBridge AI. {t('footer.rights')}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">{t('footer.terms')}</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{t('footer.privacy')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
