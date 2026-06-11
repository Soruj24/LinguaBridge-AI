"use client";

import { toast } from "sonner";
import { CheckCircle, AlertTriangle, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityStatusCardProps {
  emailVerified: boolean;
  userEmail: string;
  twoFactorEnabled: boolean;
  setShow2FASetup: (v: boolean) => void;
  setCurrentPassword: (v: string) => void;
  setVerificationCode: (v: string) => void;
}

export function SecurityStatusCard({
  emailVerified,
  userEmail,
  twoFactorEnabled,
  setShow2FASetup,
  setCurrentPassword,
  setVerificationCode,
}: SecurityStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Account Status
        </CardTitle>
        <CardDescription>Your account security overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${emailVerified ? "bg-green-100" : "bg-amber-100"}`}>
              {emailVerified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">
                {emailVerified ? "Your email is verified" : "Please verify your email"}
              </p>
            </div>
          </div>
          {!emailVerified && (
            <Button variant="outline" size="sm" onClick={() => {
              fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
              });
              toast.success("Verification email sent");
            }}>
              Verify
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${twoFactorEnabled ? "bg-green-100" : "bg-muted"}`}>
              {twoFactorEnabled ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? "Enabled" : "Not enabled"}
              </p>
            </div>
          </div>
          <Button
            variant={twoFactorEnabled ? "destructive" : "outline"}
            size="sm"
            onClick={() => {
              setShow2FASetup(!twoFactorEnabled);
              setCurrentPassword("");
              setVerificationCode("");
            }}
          >
            {twoFactorEnabled ? "Disable" : "Enable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
