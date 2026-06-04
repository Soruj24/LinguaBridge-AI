"use client";

import { motion } from "framer-motion";
import { ArrowUp, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const messages = [
  { side: "left", text: "¡Hola! ¿Cómo estás?", translation: "Hello! How are you?", time: "2 min ago" },
  { side: "right", text: "I'm great! Thanks for asking.", translation: "¡Estoy genial! Gracias por preguntar.", time: "1 min ago" },
  { side: "left", text: "¿Te gustaría practicar español conmigo?", translation: "Would you like to practice Spanish with me?", time: "Just now" },
];

export function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-full max-w-[380px] mx-auto"
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>

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

        <div className="space-y-3 px-4 py-4 min-h-[240px]">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.side === "left" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
              className={cn("flex", msg.side === "left" ? "justify-start" : "justify-end")}
            >
              <div className={cn("max-w-[85%] space-y-1", msg.side === "left" ? "items-start" : "items-end")}>
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

        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <span className="text-xs text-muted-foreground flex-1">Type a message...</span>
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <ArrowUp className="h-3 w-3 text-primary-foreground rotate-45" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent rounded-3xl blur-3xl" />
    </motion.div>
  );
}
