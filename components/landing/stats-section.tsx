"use client";

import { stats } from "@/components/landing/data";

export function StatsSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold">{s.value.toLocaleString()}{s.suffix}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
