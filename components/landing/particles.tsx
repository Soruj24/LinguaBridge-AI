"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateParticles() {
  return Array.from({ length: 30 }, (_, i) => ({
    key: i,
    top: `${seededRandom(i * 3 + 1) * 100}%`,
    left: `${seededRandom(i * 3 + 2) * 100}%`,
    duration: 3 + seededRandom(i * 3 + 3) * 4,
    delay: seededRandom(i * 3 + 4) * 5,
  }));
}

export function Particles() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.key}
          className="absolute h-1 w-1 rounded-full bg-primary/30"
          style={{ top: p.top, left: p.left }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
