"use client";

import { MessageSquare, Mic, ShieldCheck } from "lucide-react";
import { cn } from "@/utils";
import { FadeIn } from "@/components/features/landing/components/animations/fade-in";

type FeatureDetail = {
  icon: typeof MessageSquare;
  title: string;
  desc: string;
  side: "left" | "right";
};

const FEATURES: FeatureDetail[] = [
  { icon: MessageSquare, title: "Real‑time Translation", desc: "Messages are translated in milliseconds as they arrive. Your conversation flows naturally, just like speaking the same language.", side: "left" },
  { icon: Mic, title: "Voice & Speech Translation", desc: "Speak in your native language and your voice is transcribed, translated, and synthesized into the target language.", side: "right" },
  { icon: ShieldCheck, title: "Enterprise‑Grade Security", desc: "End‑to‑end encryption ensures your conversations stay private. We never store or train on your translated content.", side: "left" },
];

export function FeatureDetailSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-20">
        {FEATURES.map((item) => (
          <FadeIn
            key={item.title}
            direction={item.side === "left" ? "left" : "right"}
            delay={0.1}
          >
            <div className={cn("grid md:grid-cols-2 gap-8 md:gap-12 items-center", item.side === "right" && "direction-rtl [&>*]:[direction:ltr]")}>
              <div className={cn("space-y-4", item.side === "right" && "md:order-2")}>
                <div className="inline-flex p-2.5 rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
              <div className={cn("aspect-[4/3] rounded-xl border bg-card flex items-center justify-center", item.side === "right" && "md:order-1")}>
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
