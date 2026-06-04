"use client";

import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/navigation";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";

type FormValues = z.infer<z.ZodObject<{ email: z.ZodString; password: z.ZodString }>>;

interface LoginFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showResendVerification: boolean;
  onResendVerification: () => Promise<void>;
}

export function LoginForm({
  form, onSubmit, isLoading, showPassword, setShowPassword,
  showResendVerification, onResendVerification,
}: LoginFormProps) {
  const t = useTranslations('Auth');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">{t('login.email')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input placeholder="you@example.com" {...field} className="h-11 rounded-xl pl-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50" />
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
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">{t('login.password')}</FormLabel>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input type={showPassword ? "text" : "password"} {...field} className="h-11 rounded-xl pl-10 pr-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <div className="flex items-center justify-center h-4 w-4 rounded border border-border/70 bg-background/50 group-hover:border-primary/50 transition-colors">
            <input type="checkbox" className="peer sr-only" />
            <Check className="h-3 w-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
            Remember me for 30 days
          </span>
        </label>
        {showResendVerification && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{t('verification.notVerified')}</p>
                <button type="button" onClick={onResendVerification} className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mt-1 underline underline-offset-2">
                  {t('verification.resend')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <Button className={cn("w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all", isLoading && "opacity-90")} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('login.loggingIn')}</span>
          ) : (
            <span className="flex items-center gap-1">{t('login.submit')} <ChevronRight className="h-4 w-4" /></span>
          )}
        </Button>
      </form>
    </Form>
  );
}
