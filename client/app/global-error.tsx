"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Shield,
  AlertCircle,
} from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);

    // You can send to your error tracking service
    // e.g., Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-destructive/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold">
                Critical Error
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Something went seriously wrong with the application
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-mono text-destructive break-all">
                      {error.message || "Unknown critical error"}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-muted-foreground">
                        Error Reference:{" "}
                        <span className="font-mono">{error.digest}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">What happened?</p>
                    <p className="text-sm text-muted-foreground">
                      A critical error has occurred that affects the entire
                      application. This could be due to a configuration issue,
                      missing dependencies, or a fatal runtime error.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Our team has been automatically notified. Please try
                  refreshing the page or contact support if the issue persists.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex gap-4 justify-center flex-wrap">
              <Button onClick={reset} size="lg" className="min-w-[120px]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              If you continue to see this error, please contact support at{" "}
              <a
                href="mailto:support@example.com"
                className="underline hover:text-primary"
              >
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
