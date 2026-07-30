"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/utils";

const messages = [
  { side: "left", text: "¡Hola! ¿Cómo estás?", translation: "Hello! How are you?" },
  { side: "right", text: "I'm great! Thanks for asking.", translation: "¡Estoy genial! Gracias por preguntar." },
  { side: "left", text: "¿Te gustaría practicar español conmigo?", translation: "Would you like to practice Spanish with me?" },
];

export function ChatMockup() {
  return (
    <div className="w-full max-w-[380px] mx-auto">
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">M</div>
          <div>
            <p className="text-sm font-medium">Chat with Maria</p>
            <p className="text-[11px] text-green-500">Online</p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4 min-h-[220px]">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.side === "left" ? "justify-start" : "justify-end")}>
              <div className="max-w-[85%] space-y-1">
                <div className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  msg.side === "left" ? "bg-muted" : "bg-primary text-primary-foreground"
                )}>
                  {msg.text}
                </div>
                <div className={cn(
                  "rounded-xl px-3 py-1.5 text-xs",
                  msg.side === "left" ? "bg-primary/10 text-primary" : "bg-primary/20 text-primary-foreground"
                )}>
                  <Sparkles className="inline h-3 w-3 mr-1 align-text-top" />
                  {msg.translation}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t px-4 py-3">
          <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Type a message...</div>
        </div>
      </div>
    </div>
  );
}
