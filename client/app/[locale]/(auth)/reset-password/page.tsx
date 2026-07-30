"use client";

import { useResetPassword } from "@/components/features/auth/hooks/use-reset-password";
import { ResetPasswordForm, ResetPasswordInvalid } from "@/components/features/auth/components/reset-index";

export default function ResetPasswordPage() {
  const r = useResetPassword();

  if (!r.isValid) return <ResetPasswordInvalid />;

  return (
    <ResetPasswordForm
      form={r.form}
      onSubmit={r.onSubmit}
      isLoading={r.isLoading}
      isSuccess={r.isSuccess}
      showPassword={r.showPassword}
      setShowPassword={r.setShowPassword}
      showConfirmPassword={r.showConfirmPassword}
      setShowConfirmPassword={r.setShowConfirmPassword}
    />
  );
}
