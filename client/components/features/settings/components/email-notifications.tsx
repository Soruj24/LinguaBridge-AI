"use client";

import { Mail, ShieldAlert, Megaphone } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { Control } from "react-hook-form";
import type { SettingsFormValues } from "@/schemas/settings";

interface SettingsEmailNotificationsProps {
  control: Control<SettingsFormValues>;
}

export function SettingsEmailNotifications({ control }: SettingsEmailNotificationsProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>Email Notifications</span>
      </div>
      <div className="space-y-3">
        <FormField
          control={control}
          name="emailPreferences.marketing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">Marketing Emails</FormLabel>
                  <FormDescription className="text-xs">
                    Product updates, tips, and promotional content.
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
          name="emailPreferences.security"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium">Security Emails</FormLabel>
                  <FormDescription className="text-xs">
                    Login alerts, password resets, and security notifications.
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
