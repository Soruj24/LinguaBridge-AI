"use client";

import { useVerifyEmail } from "@/components/features/auth/hooks/use-verify-email";
import { VerifyEmailStatus } from "@/components/features/auth/components/verify-index";

export default function VerifyEmailPage() {
  const { status, countdown } = useVerifyEmail();
  return <VerifyEmailStatus status={status} countdown={countdown} />;
}
