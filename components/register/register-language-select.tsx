"use client";

import { Search } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Control } from "react-hook-form";
import type { RegisterFormValues } from "@/lib/schemas/register";

interface RegisterLanguageSelectProps {
  control: Control<RegisterFormValues>;
  langSearch: string;
  onLangSearchChange: (v: string) => void;
  filteredLanguages: { code: string; name: string }[];
}

export function RegisterLanguageSelect({
  control, langSearch, onLangSearchChange, filteredLanguages,
}: RegisterLanguageSelectProps) {
  return (
    <FormField
      control={control}
      name="preferredLanguage"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Preferred Language</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30 bg-background/50">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[280px]">
              <div className="flex items-center gap-2 px-3 pb-2 pt-1.5 border-b">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  placeholder="Search languages..."
                  className="flex-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground/60"
                  value={langSearch}
                  onChange={(e) => onLangSearchChange(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="overflow-y-auto max-h-[200px]">
                {filteredLanguages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No languages found</p>
                ) : (
                  filteredLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
