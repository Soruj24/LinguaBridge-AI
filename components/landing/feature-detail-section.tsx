"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, MessageSquare, Mic, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureDetail = {
  icon: typeof MessageSquare;
  title: string;
  desc: string;
  accent: string;
  side: "left" | "right";
};

const FEATURES: FeatureDetail[] = [
  { icon: MessageSquare, title: "Real‑time Translation", desc: "Messages are translated in milliseconds as they arrive. Your conversation flows naturally, just like speaking the same language.", accent: "from-blue-500 to-blue-600", side: "left" },
  { icon: Mic, title: "Voice & Speech Translation", desc: "Speak in your native language and your voice is transcribed, translated, and synthesized into the target language — preserving tone and emotion.", accent: "from-purple-500 to-purple-600", side: "right" },
  { icon: ShieldCheck, title: "Enterprise‑Grade Security", desc: "End‑to‑end encryption ensures your conversations stay private. We never store or train on your translated content.", accent: "from-cyan-500 to-cyan-600", side: "left" },
];

export function FeatureDetailSection() {
  return (
    <section className="w-full py-28 md:py-36 px-4 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent -z-10" />
      <div className="mx-auto max-w-7xl space-y-28 md:space-y-36">
        {FEATURES.map((item) => (
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
  );
}
