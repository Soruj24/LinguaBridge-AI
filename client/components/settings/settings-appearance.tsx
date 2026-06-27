"use client";

import { Palette, Languages } from "lucide-react";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function SettingsAppearance() {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Palette className="h-4 w-4" />
        <span>Appearance</span>
      </div>
      <ThemeSelector variant="full" />
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground">
          <Languages className="h-4 w-4" />
          <span>Interface Language</span>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
