"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { THEMES, ThemePreset, getCSSVariables } from "@/lib/themes";
import { Palette, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ThemeSelectorProps {
  variant?: "icon" | "full";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectTheme = async (theme: ThemePreset) => {
    setIsSaving(true);
    try {
      await axios.put("/api/user/update", {
        theme: theme.id,
      });

      setCurrentTheme(theme.id);
      
      const cssVars = getCSSVariables(theme);
      document.documentElement.style.cssText = cssVars;
      
      toast.success(`Theme: ${theme.name}`);
    } catch (error) {
      console.error("Failed to save theme:", error);
      toast.error("Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (variant === "icon") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <motion.button
                key={theme.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => handleSelectTheme(theme)}
                className={`relative h-10 w-10 rounded-lg border-2 overflow-hidden ${
                  currentTheme === theme.id ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-muted"
                }`}
                style={{
                  background: `hsl(${theme.colors.background})`,
                  borderRadius: theme.radius,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `hsl(${theme.colors.primary})`,
                    opacity: 0.7,
                  }}
                />
                {currentTheme === theme.id && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                )}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
        <Palette className="h-4 w-4" />
        Theme
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {THEMES.map((theme) => (
          <motion.button
            key={theme.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => handleSelectTheme(theme)}
            disabled={isSaving}
            className={`relative h-14 w-full rounded-xl border-2 overflow-hidden transition-all hover:scale-105 hover:shadow-md ${
              currentTheme === theme.id
                ? "border-primary ring-2 ring-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `hsl(${theme.colors.background})`,
              }}
            >
              <div
                className="h-6 w-6 rounded-full"
                style={{
                  background: `hsl(${theme.colors.primary})`,
                }}
              />
            </div>
            {currentTheme === theme.id && (
              <Check className="absolute bottom-1 right-1 h-3 w-3 text-white bg-black/50 rounded-full" />
            )}
            <span className="absolute bottom-0.5 left-0 right-0 text-center text-[10px] font-medium truncate px-1">
              {theme.name}
            </span>
          </motion.button>
        ))}
      </div>
      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}