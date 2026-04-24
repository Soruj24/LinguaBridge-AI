"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator({ userName }: { userName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center space-x-1.5 p-3 bg-gradient-to-br from-muted/70 to-muted/40 rounded-2xl w-fit shadow-lg border border-border/30 backdrop-blur-md">
        <motion.div
          className="w-2.5 h-2.5 bg-primary rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
        />
        <motion.div
          className="w-2.5 h-2.5 bg-primary rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />
        <motion.div
          className="w-2.5 h-2.5 bg-primary rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground animate-pulse">
          {userName}
        </span>
      )}
    </motion.div>
  );
}
