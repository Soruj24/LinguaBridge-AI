"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { verifyEmailAction } from "@/app/actions/auth.action";

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token ? "error" : "loading"
  );
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmailAction(token).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setStatus("success");
        toast.success("Email verified successfully!");
      } else {
        setStatus("error");
        toast.error(result.error || "Failed to verify email. The link may have expired.");
      }
    }).catch(() => {
      if (cancelled) return;
      setStatus("error");
      toast.error("Failed to verify email. The link may have expired.");
    });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      router.push("/en/dashboard");
    }
    return () => clearInterval(timer);
  }, [status, countdown, router]);

  return { status, countdown };
}
