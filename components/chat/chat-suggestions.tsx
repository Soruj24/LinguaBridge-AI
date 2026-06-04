"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

export function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex gap-2 overflow-x-auto px-3 md:px-5 pt-3 pb-2 scrollbar-hide">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-sm font-medium text-foreground hover:from-primary/20 hover:to-primary/10 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                <span>{suggestion}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
