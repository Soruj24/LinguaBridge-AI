"use client";

import { Wifi, Accessibility, AudioLines } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { Control } from "react-hook-form";
import type { SettingsFormValues } from "@/schemas/settings";

interface SettingsAccessibilityProps {
  control: Control<SettingsFormValues>;
}

export function SettingsAccessibility({ control }: SettingsAccessibilityProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Accessibility className="h-4 w-4" />
        <span>Accessibility & Data</span>
      </div>
      <div className="space-y-3">
        <FormField
          control={control}
          name="preferences.lowBandwidth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">Low Bandwidth Mode</FormLabel>
                  <FormDescription className="text-xs">
                    Disable animations and high-res media.
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="preferences.reduceMotion"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted">
                  <Accessibility className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">Reduce Motion</FormLabel>
                  <FormDescription className="text-xs">
                    Minimize UI animations.
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="preferences.autoPlayAudio"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted">
                  <AudioLines className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">Auto-play Audio</FormLabel>
                  <FormDescription className="text-xs">
                    Automatically play voice messages.
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
