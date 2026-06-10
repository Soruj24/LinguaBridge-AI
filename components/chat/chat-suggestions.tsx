"use client";

import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

export function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-3 md:px-5 pt-3 pb-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-foreground hover:bg-primary/20 transition-colors shrink-0 whitespace-nowrap"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
