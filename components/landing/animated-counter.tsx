"use client";

import { useState, useEffect, useRef } from "react";
import { useIntersection } from "@/hooks/use-intersection";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({ end, suffix = "", duration = 2 }: AnimatedCounterProps) {
  const { ref, inView } = useIntersection();
  const [count, setCount] = useState(0);
  const id = useRef<number>(undefined);

  useEffect(() => {
    if (!inView) return;

    let start: number;
    const fn = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) id.current = requestAnimationFrame(fn);
    };

    id.current = requestAnimationFrame(fn);
    return () => {
      if (id.current) cancelAnimationFrame(id.current);
    };
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}
