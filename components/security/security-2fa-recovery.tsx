"use client";

import { CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Security2FARecoveryProps {
  recoveryCodes: string[];
  onCopy: () => void;
  onDone: () => void;
}

export function Security2FARecovery({ recoveryCodes, onCopy, onDone }: Security2FARecoveryProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800 dark:text-green-200">2FA Enabled Successfully!</p>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">
          Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </p>
      </div>
      <div className="relative">
        <div className="bg-muted p-4 rounded-lg font-mono text-sm grid grid-cols-2 gap-2">
          {recoveryCodes.map((code, i) => (
            <span key={i}>{code}</span>
          ))}
        </div>
        <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <Button onClick={onDone}>Done</Button>
    </div>
  );
}
