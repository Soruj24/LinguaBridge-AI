"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { languages } from "@/lib/languages";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/register";

export function useRegistration() {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setShowSuccess(true);
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form, isLoading, showPassword, setShowPassword,
    showSuccess, showRequirements, setShowRequirements,
    langSearch, setLangSearch, passwordValue, currentStep,
    filteredLanguages, onSubmit, router,
  };
}
