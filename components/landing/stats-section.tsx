"use client";

import { motion } from "framer-motion";
import { stats } from "@/components/landing/data";
import { AnimatedCounter } from "@/components/landing/animated-counter";

export function StatsSection() {
  return (
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
  );
}
