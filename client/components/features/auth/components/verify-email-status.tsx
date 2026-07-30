"use client";

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
    <div>
      <Card className="w-full border border-border/50 bg-card/50 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email Verified"}
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
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground text-sm">Processing...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to LinguaBridge AI!</h3>
              <p className="text-muted-foreground text-sm max-w-[300px] mb-3">Your email has been verified. Redirecting to dashboard...</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Redirecting in {countdown}s</span>
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Invalid or Expired Link</h3>
              <p className="text-muted-foreground text-sm max-w-[300px]">The verification link is invalid or has expired. Please request a new one.</p>
            </div>
          )}
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
    </div>
  );
}
