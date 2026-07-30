"use client";

import { Smartphone, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TwoFactorSetupData } from "@/types/shared";
import { Security2FARecovery } from "./two-factor-recovery";
import { Security2FADisable } from "./two-factor-verify";
import { Security2FASetup } from "./two-factor-setup";

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
  const closeSetup = () => {
    props.setShow2FASetup(false);
    props.setTwoFactorSetup(null);
    props.setVerificationCode("");
  };

  return (
    <>
      {props.show2FASetup && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {props.twoFactorEnabled ? "Disable 2FA" : "Setup 2FA"}
                </span>
                <Button variant="ghost" size="sm" onClick={closeSetup}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                {props.twoFactorEnabled
                  ? "Enter your password and 2FA code to disable two-factor authentication"
                  : "Scan the QR code with your authenticator app to enable 2FA"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {props.showRecoveryCodes ? (
                <Security2FARecovery
                  recoveryCodes={props.recoveryCodes}
                  onCopy={props.copyRecoveryCodes}
                  onDone={() => {
                    props.setShowRecoveryCodes(false);
                    closeSetup();
                  }}
                />
              ) : props.twoFactorEnabled ? (
                <Security2FADisable
                  currentPassword={props.currentPassword}
                  setCurrentPassword={props.setCurrentPassword}
                  showCurrentPassword={props.showCurrentPassword}
                  setShowCurrentPassword={props.setShowCurrentPassword}
                  verificationCode={props.verificationCode}
                  setVerificationCode={props.setVerificationCode}
                  isLoading={props.isLoading}
                  onDisable={props.handleDisable2FA}
                  onCancel={() => props.setShow2FASetup(false)}
                />
              ) : props.twoFactorSetup ? (
                <Security2FASetup
                  twoFactorSetup={props.twoFactorSetup}
                  verificationCode={props.verificationCode}
                  setVerificationCode={props.setVerificationCode}
                  isLoading={props.isLoading}
                  onVerify={props.handleVerify2FA}
                  onCancel={closeSetup}
                />
              ) : (
                <Button onClick={props.handleSetup2FA} disabled={props.isLoading}>
                  {props.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start 2FA Setup
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
