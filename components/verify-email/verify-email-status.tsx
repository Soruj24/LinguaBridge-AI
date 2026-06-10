"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/navigation";

interface VerifyEmailStatusProps {
  status: "loading" | "success" | "error";
  countdown: number;
}

export function VerifyEmailStatus({ status, countdown }: VerifyEmailStatusProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <Card className="w-full border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            <AnimatePresence mode="wait">
              <motion.span key={status} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                {status === "loading" && "Verifying your email..."}
                {status === "success" && "Email Verified"}
                {status === "error" && "Verification Failed"}
              </motion.span>
            </AnimatePresence>
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address"}
            {status === "success" && "Your email has been successfully verified"}
            {status === "error" && "We couldn't verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-primary" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Processing...</p>
              </motion.div>
            )}
            {status === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">Welcome to LinguaBridge AI!</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] mb-3">Your email has been verified. Redirecting to dashboard...</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Redirecting in {countdown}s</span>
                </div>
              </motion.div>
            )}
            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">Invalid or Expired Link</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">The verification link is invalid or has expired. Please request a new one.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-6">
          {status === "success" && (
            <Link className="w-full" href="/dashboard">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20">Go to Dashboard</Button>
            </Link>
          )}
          {status === "error" && (
            <>
              <Link className="w-full" href="/register">
                <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20">Sign Up Again</Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">Login</Link>
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
