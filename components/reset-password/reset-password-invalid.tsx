"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/navigation";
import { motion } from "framer-motion";

export function ResetPasswordInvalid() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <Card className="w-full border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Invalid Reset Link</CardTitle>
          <CardDescription className="text-sm">
            This password reset link has expired or is invalid
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-muted-foreground text-sm max-w-[300px]">
            Please request a new password reset link.
          </p>
        </CardContent>
        <CardFooter className="pb-6">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20">
              Request New Reset Link
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
