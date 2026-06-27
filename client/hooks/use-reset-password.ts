"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { resetPasswordAction } from "@/app/actions/auth.action";

const formSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine((p) => /[A-Z]/.test(p), { message: "Password must contain at least one uppercase letter" })
    .refine((p) => /[a-z]/.test(p), { message: "Password must contain at least one lowercase letter" })
    .refine((p) => /\d/.test(p), { message: "Password must contain at least one number" })
    .refine((p) => /\W/.test(p), { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const isValid = !!token;

  async function onSubmit(values: FormValues) {
    if (!token) return;
    setIsLoading(true);
    const result = await resetPasswordAction(token, values.password);
    if (result.success) {
      setIsSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      toast.error(result.error || "Failed to reset password. The link may have expired.");
    }
    setIsLoading(false);
  }

  return {
    form, isLoading, isSuccess, showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword, isValid, onSubmit, router,
  };
}
