"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Copy, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TwoFactorSetupData } from "@/types/security";

interface Security2FASectionProps {
  show2FASetup: boolean;
  twoFactorEnabled: boolean;
  twoFactorSetup: TwoFactorSetupData | null;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  recoveryCodes: string[];
  showRecoveryCodes: boolean;
  setShowRecoveryCodes: (v: boolean) => void;
  setShow2FASetup: (v: boolean) => void;
  setTwoFactorSetup: (v: TwoFactorSetupData | null) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (v: boolean) => void;
  isLoading: boolean;
  handleSetup2FA: () => Promise<void>;
  handleVerify2FA: () => Promise<void>;
  handleDisable2FA: () => Promise<void>;
  copyRecoveryCodes: () => void;
}

export function Security2FASection(props: Security2FASectionProps) {
  const {
    show2FASetup, twoFactorEnabled, twoFactorSetup,
    verificationCode, setVerificationCode,
    recoveryCodes, showRecoveryCodes, setShowRecoveryCodes,
    setShow2FASetup, setTwoFactorSetup,
    currentPassword, setCurrentPassword,
    showCurrentPassword, setShowCurrentPassword,
    isLoading, handleSetup2FA, handleVerify2FA, handleDisable2FA, copyRecoveryCodes,
  } = props;

  return (
    <AnimatePresence>
      {show2FASetup && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {twoFactorEnabled ? "Disable 2FA" : "Setup 2FA"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShow2FASetup(false);
                    setTwoFactorSetup(null);
                    setVerificationCode("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                {twoFactorEnabled
                  ? "Enter your password and 2FA code to disable two-factor authentication"
                  : "Scan the QR code with your authenticator app to enable 2FA"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showRecoveryCodes ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-800 dark:text-green-200">
                        2FA Enabled Successfully!
                      </p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={copyRecoveryCodes}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={() => {
                    setShowRecoveryCodes(false);
                    setShow2FASetup(false);
                    setTwoFactorSetup(null);
                  }}>
                    Done
                  </Button>
                </div>
              ) : twoFactorEnabled ? (
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
                    <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Disable 2FA
                    </Button>
                    <Button variant="ghost" onClick={() => setShow2FASetup(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : twoFactorSetup ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={twoFactorSetup.qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48 border rounded-lg"
                    />
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
                    <Button onClick={handleVerify2FA} disabled={isLoading || verificationCode.length !== 6}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify & Enable
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setShow2FASetup(false);
                      setTwoFactorSetup(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleSetup2FA} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start 2FA Setup
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
