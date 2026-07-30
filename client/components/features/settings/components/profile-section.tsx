"use client";

import { User, Eye, Keyboard, EyeOff } from "lucide-react";
import { Loader2 } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/utils";
import type { UseFormReturn } from "react-hook-form";
import type { SettingsFormValues } from "@/schemas/settings";

interface SettingsProfileProps {
  form: UseFormReturn<SettingsFormValues>;
  onSubmit: (values: SettingsFormValues) => Promise<void>;
  isLoading: boolean;
}

export function SettingsProfile({ form, onSubmit, isLoading }: SettingsProfileProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Profile</span>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Bio</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Tell others about yourself..."
                    className="min-h-[100px] rounded-xl resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {(field.value ?? "").length}/500
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Preferred Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Messages will be translated to this language.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Profile Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showLastSeen"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <FormLabel className="text-sm font-medium">Show Last Seen</FormLabel>
                    <FormDescription className="text-xs">
                      Let others see when you were last active
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showTypingIndicator"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <FormLabel className="text-sm font-medium">Show typing indicator</FormLabel>
                    <FormDescription className="text-xs">
                      Let others see when you're typing
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showReadReceipts"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <FormLabel className="text-sm font-medium">Send read receipts</FormLabel>
                    <FormDescription className="text-xs">
                      Let others see when you've read their messages
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
