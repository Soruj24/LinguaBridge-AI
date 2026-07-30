"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Security2FADisableProps {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (v: boolean) => void;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  isLoading: boolean;
  onDisable: () => Promise<void>;
  onCancel: () => void;
}

export function Security2FADisable({
  currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword,
  verificationCode, setVerificationCode,
  isLoading, onDisable, onCancel,
}: Security2FADisableProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="disable-password">Your Password</Label>
        <div className="relative">
          <Input
            id="disable-password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="disable-token">2FA Code or Recovery Code</Label>
        <Input
          id="disable-token"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code or recovery code"
          maxLength={8}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={onDisable} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Disable 2FA
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
