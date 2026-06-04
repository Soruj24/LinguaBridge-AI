"use client";

import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  key: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
      {PARTICLES.map((p) => (
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
