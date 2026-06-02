"use client";

import { useState, useMemo } from "react";
import { useRouter, Link } from "@/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Globe, Mail, Lock, User, Eye, EyeOff,
  CheckCircle, ChevronRight, Loader2, Search,
} from "lucide-react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordStrength, PasswordRequirements } from "@/components/password-strength";
import { SocialLogin } from "@/components/social-login";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => /\d/.test(password), {
      message: "Password must contain at least one number",
    }),
  preferredLanguage: z.string().min(2, "Language is required"),
});

const languages = [
  { code: "en", name: "English" }, { code: "es", name: "Spanish" },
  { code: "fr", name: "French" }, { code: "de", name: "German" },
  { code: "zh", name: "Chinese" }, { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" }, { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" }, { code: "it", name: "Italian" },
  { code: "bn", name: "Bengali" }, { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" }, { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" }, { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" }, { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" }, { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" }, { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" }, { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" }, { code: "cs", name: "Czech" },
  { code: "ms", name: "Malay" }, { code: "sk", name: "Slovak" },
  { code: "uk", name: "Ukrainian" }, { code: "ro", name: "Romanian" },
  { code: "hu", name: "Hungarian" }, { code: "bg", name: "Bulgarian" },
  { code: "sr", name: "Serbian" }, { code: "hr", name: "Croatian" },
  { code: "sl", name: "Slovenian" }, { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" }, { code: "et", name: "Estonian" },
  { code: "fa", name: "Persian" }, { code: "ur", name: "Urdu" },
  { code: "ta", name: "Tamil" }, { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" }, { code: "kn", name: "Kannada" },
  { code: "gu", name: "Gujarati" }, { code: "mr", name: "Marathi" },
  { code: "pa", name: "Punjabi" }, { code: "si", name: "Sinhala" },
  { code: "my", name: "Burmese" }, { code: "km", name: "Khmer" },
  { code: "sw", name: "Swahili" },
];

/* ---------- steps ---------- */
const steps = [
  { label: "Account", key: "account" },
  { label: "Verify", key: "verify" },
  { label: "Done", key: "done" },
];

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      preferredLanguage: locale,
    },
  });

  const passwordValue = form.watch("password");

  const currentStep = showSuccess ? 3 : 1;

  const filteredLanguages = useMemo(
    () => langSearch
      ? languages.filter((l) => l.name.toLowerCase().includes(langSearch.toLowerCase()))
      : languages,
    [langSearch]
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        return data;
      });

      setShowSuccess(true);
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

          {/* step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold transition-all duration-300",
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {i + 1 <= currentStep ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  i + 1 <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-px w-6 transition-colors",
                    i + 1 < currentStep ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>

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
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-emerald-400/20"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2">Check your email!</h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mb-5 leading-relaxed">
                  We&apos;ve sent a verification link to{" "}
                  <span className="font-medium text-foreground">{form.getValues("email")}</span>.
                  Click the link to activate your account.
                </p>
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground w-full max-w-[280px] justify-center">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Check your inbox (and spam)</span>
                  </div>
                  <Link href="/login" className="w-full max-w-[280px]">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl"
                    >
                      Go to login
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Form {...form}>
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
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                          <PasswordRequirements password={passwordValue || ""} />
                        </div>
                      </motion.div>
                    )}

                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Preferred Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30 bg-background/50">
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[280px]">
                              <div className="flex items-center gap-2 px-3 pb-2 pt-1.5 border-b">
                                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                <input
                                  placeholder="Search languages..."
                                  className="flex-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground/60"
                                  value={langSearch}
                                  onChange={(e) => setLangSearch(e.target.value)}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="overflow-y-auto max-h-[200px]">
                                {filteredLanguages.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-4">No languages found</p>
                                ) : (
                                  filteredLanguages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                      {lang.name}
                                    </SelectItem>
                                  ))
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
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
                </Form>
              </motion.div>
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
