"use client";

import { useResetPassword } from "@/hooks/use-reset-password";
import { ResetPasswordForm, ResetPasswordInvalid } from "@/components/reset-password";

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
