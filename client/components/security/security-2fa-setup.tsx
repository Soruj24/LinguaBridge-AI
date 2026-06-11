"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TwoFactorSetupData } from "@/types/security";

interface Security2FASetupProps {
  twoFactorSetup: TwoFactorSetupData;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  isLoading: boolean;
  onVerify: () => Promise<void>;
  onCancel: () => void;
}

export function Security2FASetup({
  twoFactorSetup, verificationCode, setVerificationCode,
  isLoading, onVerify, onCancel,
}: Security2FASetupProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
        <p className="text-xs font-mono bg-muted p-2 rounded">
          Manual key: {twoFactorSetup.secret}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verify-code">Enter 6-digit code</Label>
        <Input
          id="verify-code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest font-mono"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onVerify} disabled={isLoading || verificationCode.length !== 6}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify & Enable
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
