"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

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
    axios.post("/api/auth/verify-email", { token }).then(() => {
      if (cancelled) return;
      setStatus("success");
      toast.success("Email verified successfully!");
    }).catch(() => {
      if (cancelled) return;
      setStatus("error");
      toast.error("Failed to verify email. The link may have expired.");
    });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); router.push("/dashboard"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, router]);

  return { status, countdown };
}
