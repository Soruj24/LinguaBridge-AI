"use client";

import { User } from "lucide-react";
import { Loader2 } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/lib/languages";
import type { UseFormReturn } from "react-hook-form";
import type { SettingsFormValues } from "@/lib/schemas/settings";

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
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
