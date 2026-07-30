"use client";

import { CheckCircle } from "lucide-react";
import { cn } from "@/utils";

const steps = [
  { label: "Account", key: "account" },
  { label: "Verify", key: "verify" },
  { label: "Done", key: "done" },
];

interface RegisterStepIndicatorProps {
  currentStep: number;
}

export function RegisterStepIndicator({ currentStep }: RegisterStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold transition-all duration-300",
            i + 1 <= currentStep
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {i + 1 <= currentStep ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={cn(
            "text-xs font-medium transition-colors",
            i + 1 <= currentStep ? "text-foreground" : "text-muted-foreground"
          )}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={cn(
              "h-px w-6 transition-colors",
              i + 1 < currentStep ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
