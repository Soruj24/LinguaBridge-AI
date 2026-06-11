"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Languages } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const UI_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

interface LanguageSwitcherProps {
  variant?: "button" | "select";
  className?: string;
}

export function LanguageSwitcher({ variant = "select", className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newLocale: string) => {
    if (newLocale === locale) return;

    setIsChanging(true);
    try {
      await axios.put("/api/user/update", {
        preferredLanguage: newLocale,
      });

      router.replace(pathname, { locale: newLocale });
      toast.success("Language changed");
    } catch (error) {
      console.error("Failed to change language:", error);
      toast.error("Failed to change language");
    } finally {
      setIsChanging(false);
    }
  };

  if (variant === "button") {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            const currentIndex = UI_LANGUAGES.findIndex((l) => l.code === locale);
            const nextIndex = (currentIndex + 1) % UI_LANGUAGES.length;
            handleChange(UI_LANGUAGES[nextIndex].code);
          }}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span>{UI_LANGUAGES.find((l) => l.code === locale)?.flag}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select value={locale} onValueChange={handleChange} disabled={isChanging}>
        <SelectTrigger className="w-full gap-2 h-11 rounded-xl">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {UI_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="gap-2">
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}