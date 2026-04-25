"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await axios.post("/api/auth/verify-email", { token });
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (error) {
        setStatus("error");
        toast.error("Failed to verify email. The link may have expired.");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="space-y-1">
        <div className="hidden lg:flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">LinguaBridge AI</span>
        </div>
        <CardTitle className="text-2xl font-bold">
          {status === "loading" && "Verifying..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </CardTitle>
        <CardDescription>
          {status === "loading" && "Please wait while we verify your email address"}
          {status === "success" && "Your email has been successfully verified"}
          {status === "error" && "We couldn't verify your email address"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm">Processing...</p>
          </motion.div>
        )}
        
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to LinguaBridge AI!</h3>
            <p className="text-muted-foreground text-sm max-w-[300px]">
              Your email has been verified. You can now login and start using all features.
            </p>
          </motion.div>
        )}
        
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invalid or Expired Link</h3>
            <p className="text-muted-foreground text-sm max-w-[300px]">
              The verification link is invalid or has expired. Please request a new one.
            </p>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {status === "success" && (
          <Link className="w-full" href="/login">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20">
              Go to Login
            </Button>
          </Link>
        )}
        {status === "error" && (
          <>
            <Link className="w-full" href="/register">
              <Button className="w-full h-11 rounded-xl">
                Sign Up Again
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </>
        )}
      </CardFooter>
    </Card>
  );
}