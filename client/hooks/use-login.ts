"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resendVerificationAction } from "@/app/actions/auth.action";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof formSchema>;

export function useLogin() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
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
          const session = await getSession();
          const preferredLanguage = (session?.user as any)?.preferredLanguage || "en";
          router.push("/dashboard", { locale: preferredLanguage });
          router.refresh();
        } catch {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      toast.error(t('errors.generic'));
      setIsLoading(false);
    }
  }

  async function resendVerification() {
    const result = await resendVerificationAction(form.getValues("email"));
    if (result.success) {
      toast.success(t('verification.sent'));
    } else {
      toast.error(t('errors.generic'));
    }
  }

  return {
    form, isLoading, showPassword, setShowPassword,
    showResendVerification, onSubmit, resendVerification,
  };
}
