"use client";

import { User, Mail, Lock, Eye, EyeOff, ChevronRight, Loader2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrength, PasswordRequirements } from "@/components/ui/password-strength";
import { RegisterLanguageSelect } from "./language-select";
import { cn } from "@/utils";
import type { UseFormReturn } from "react-hook-form";
import type { RegisterFormValues } from "@/schemas/register";

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showRequirements: boolean;
  setShowRequirements: (v: boolean) => void;
  passwordValue: string;
  langSearch: string;
  setLangSearch: (v: string) => void;
  filteredLanguages: { code: string; name: string }[];
}

export function RegisterFormFields({
  form, onSubmit, isLoading, showPassword, setShowPassword,
  showRequirements, setShowRequirements,
  passwordValue, langSearch, setLangSearch, filteredLanguages,
}: RegisterFormFieldsProps) {
  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="h-11 rounded-xl pl-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="h-11 rounded-xl pl-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    className="h-11 rounded-xl pl-10 pr-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50"
                    onFocus={() => setShowRequirements(true)}
                    onBlur={() => setTimeout(() => setShowRequirements(false), 200)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <PasswordStrength password={field.value || ""} />
            </FormItem>
          )}
        />
        {showRequirements && passwordValue && (
          <div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
              <PasswordRequirements password={passwordValue || ""} />
            </div>
          </div>
        )}
        <RegisterLanguageSelect
          control={form.control}
          langSearch={langSearch}
          onLangSearchChange={setLangSearch}
          filteredLanguages={filteredLanguages}
        />
        <Button
          className={cn(
            "w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all",
            isLoading && "opacity-90"
          )}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Create Account
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
