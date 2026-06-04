"use client";

import { useVerifyEmail } from "@/hooks/use-verify-email";
import { VerifyEmailStatus } from "@/components/verify-email";

export default function VerifyEmailPage() {
  const { status, countdown } = useVerifyEmail();
  return <VerifyEmailStatus status={status} countdown={countdown} />;
}
