"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { SocialLogin } from "@/components/ui/social-login";
import { Link } from "@/navigation";
import { RegisterStepIndicator, RegisterFormFields, RegisterSuccess } from "@/components/register";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/resolvers";
import { useState, useMemo, useEffect } from "react";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/register";
import { toast } from "sonner";
import { registerAction } from "@/app/actions/auth.action";
import { languageMap } from "@linguabridge/shared";

const ALL_LANGUAGES = Object.entries(languageMap).map(([code, name]) => ({ code, name }));

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [langSearch, setLangSearch] = useState("");
  const [filteredLanguages, setFilteredLanguages] = useState<{ code: string; name: string }[]>(ALL_LANGUAGES);

  useEffect(() => {
    if (!langSearch) {
      setFilteredLanguages(ALL_LANGUAGES);
      return;
    }
    const q = langSearch.toLowerCase();
    setFilteredLanguages(
      ALL_LANGUAGES.filter(
        (l) => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
      )
    );
  }, [langSearch]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", preferredLanguage: "en" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    const result = await registerAction(data);
    if (result.success) {
      setShowSuccess(true);
    } else {
      toast.error(result.error || "Registration failed");
    }
    setIsLoading(false);
  };

  const r = {
    currentStep,
    showSuccess,
    isLoading,
    showPassword,
    setShowPassword,
    showRequirements,
    setShowRequirements,
    passwordValue,
    langSearch,
    setLangSearch,
    filteredLanguages,
    form,
    onSubmit,
  };

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
          <RegisterStepIndicator currentStep={r.currentStep} />
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-sm">Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <SocialLogin />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground/60 font-medium">
                Or register with email
              </span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {r.showSuccess ? (
              <RegisterSuccess email={r.form.getValues("email")} />
            ) : (
              <Form {...r.form}>
                <RegisterFormFields
                  form={r.form}
                  onSubmit={r.onSubmit}
                  isLoading={r.isLoading}
                  showPassword={r.showPassword}
                  setShowPassword={r.setShowPassword}
                  showRequirements={r.showRequirements}
                  setShowRequirements={r.setShowRequirements}
                  passwordValue={r.passwordValue}
                  langSearch={r.langSearch}
                  setLangSearch={r.setLangSearch}
                  filteredLanguages={r.filteredLanguages}
                />
              </Form>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="pb-6">
          <p className="text-sm text-muted-foreground text-center w-full">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
