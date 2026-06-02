"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Globe, Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2, ChevronRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SocialLogin } from "@/components/social-login";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error(t('errors.invalidCredentials'));
          setShowResendVerification(true);
        } else {
          toast.error(result.error);
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success(t('success.login'));

        try {
          const { data } = await axios.get("/api/user/me");
          const preferredLanguage = data.preferredLanguage || "en";
          router.push("/dashboard", { locale: preferredLanguage });
          router.refresh();
        } catch (error) {
          console.error("Failed to fetch user preferences", error);
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error(t('errors.generic'));
      setIsLoading(false);
    }
  }

  async function resendVerification() {
    try {
      await axios.post("/api/auth/resend-verification", { email: form.getValues("email") });
      toast.success(t('verification.sent'));
    } catch (error) {
      toast.error(t('errors.generic'));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="w-full border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6">
          <div className="hidden lg:flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Globe className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              LinguaBridge AI
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t('login.title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <SocialLogin />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground/60 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">{t('login.password')}</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {t('login.forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="h-11 rounded-xl pl-10 pr-10 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-background/50"
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/40">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                        {t('verification.notVerified')}
                      </p>
                      <button
                        type="button"
                        onClick={resendVerification}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mt-1 underline underline-offset-2"
                      >
                        {t('verification.resend')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

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
                    {t('login.loggingIn')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    {t('login.submit')}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="pb-6">
          <p className="text-sm text-muted-foreground text-center w-full">
            {t('login.noAccount')}{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
            >
              {t('login.signUp')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
