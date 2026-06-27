"use client";

import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialLogin } from "@/components/ui/social-login";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLogin } from "@/hooks/use-login";
import { LoginForm } from "@/components/login";

export default function LoginPage() {
  const t = useTranslations('Auth');
  const l = useLogin();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
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
          <CardDescription className="text-sm">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <SocialLogin />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground/60 font-medium">Or continue with email</span>
            </div>
          </div>
          <LoginForm
            form={l.form}
            onSubmit={l.onSubmit}
            isLoading={l.isLoading}
            showPassword={l.showPassword}
            setShowPassword={l.setShowPassword}
            showResendVerification={l.showResendVerification}
            onResendVerification={l.resendVerification}
          />
        </CardContent>
        <CardFooter className="pb-6">
          <p className="text-sm text-muted-foreground text-center w-full">
            {t('login.noAccount')}{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
              {t('login.signUp')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
