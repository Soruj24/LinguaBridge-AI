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
import { Globe, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SocialLogin } from "@/components/social-login";

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
    <Card className="w-full border-none shadow-none">
      <CardHeader className="space-y-1">
        <div className="hidden lg:flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Globe className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">LinguaBridge AI</span>
        </div>
        <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
        <CardDescription>
          {t('login.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SocialLogin />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="m@example.com" {...field} className="h-11 rounded-xl pl-10" />
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
                  <FormLabel>{t('login.password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                        className="h-11 rounded-xl pl-10 pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>

            {showResendVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('verification.notVerified')}
                </p>
                <button
                  type="button"
                  onClick={resendVerification}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 ml-auto"
                >
                  {t('verification.resend')}
                </button>
              </motion.div>
            )}

            <Button 
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? t('login.loggingIn') : t('login.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          {t('login.noAccount')}{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            {t('login.signUp')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}