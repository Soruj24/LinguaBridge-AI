"use client";

import { CheckCircle, Mail, ChevronRight } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

interface RegisterSuccessProps {
  email: string;
}

export function RegisterSuccess({ email }: RegisterSuccessProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">Check your email!</h3>
      <p className="text-muted-foreground text-sm max-w-[280px] mb-5 leading-relaxed">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>.
        Click the link to activate your account.
      </p>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground w-full max-w-[280px] justify-center">
          <Mail className="h-3.5 w-3.5" />
          <span>Check your inbox (and spam)</span>
        </div>
        <Link href="/login" className="w-full max-w-[280px]">
          <Button variant="outline" className="w-full h-11 rounded-xl">
            Go to login
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
