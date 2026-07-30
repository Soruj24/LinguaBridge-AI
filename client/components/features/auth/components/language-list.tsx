"use client";

import { Languages } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/utils";

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  dir: string;
}

interface LanguageListProps {
  languages: Language[];
  selectedLanguage: string | null;
  onSelect: (code: string) => void;
  supportedLocales: string[];
  searchQuery: string;
  t: (key: string, params?: Record<string, string>) => string;
}

export function LanguageList({
  languages,
  selectedLanguage,
  onSelect,
  supportedLocales,
  searchQuery,
  t,
}: LanguageListProps) {
  if (languages.length === 0) {
    return (
      <div className="col-span-full py-8 text-center text-muted-foreground">
        <Languages className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>{t("noResults", { query: searchQuery })}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-primary/50 hover:bg-accent group relative",
            selectedLanguage === lang.code
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border bg-card",
          )}
        >
          <span className="text-2xl shadow-sm rounded-full overflow-hidden">
            {lang.flag}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate flex items-center gap-2">
              {lang.native}
              {supportedLocales.includes(lang.code) && (
                <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">
                  UI
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {lang.name}
            </div>
          </div>
          {selectedLanguage === lang.code && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-0.5">
              <Check className="h-3 w-3" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
