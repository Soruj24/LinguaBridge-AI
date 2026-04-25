"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Copy,
  X,
  Check,
  Clock,
  Globe,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

interface LoginActivity {
  _id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  type: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
}

export default function SecurityPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const typedSession = session as {
    user?: {
      email?: string;
      name?: string;
      isEmailVerified?: boolean;
    };
  } | null;

  const userEmail = typedSession?.user?.email || "";
  const emailVerified = typedSession?.user?.isEmailVerified || false;

  useEffect(() => {
    fetch2FAStatus();
    fetchLoginActivity();
  }, []);

  async function fetchLoginActivity() {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/auth/login-activity");
      const data = await res.json();
      if (res.ok) {
        setLoginActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch login activity:", error);
    } finally {
      setActivitiesLoading(false);
    }
  }

  async function fetch2FAStatus() {
    try {
      const res = await fetch("/api/auth/2fa/setup");
      const data = await res.json();
      setTwoFactorEnabled(data.enabled);
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    }
  }

  async function handleSetup2FA() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setTwoFactorSetup(data);
      setShow2FASetup(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to setup 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify2FA() {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: verificationCode,
          secret: twoFactorSetup?.secret,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setRecoveryCodes(data.recoveryCodes);
      setShowRecoveryCodes(true);
      setTwoFactorEnabled(true);
      await update();
      await fetchLoginActivity();
      toast.success("2FA enabled successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisable2FA() {
    if (!currentPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: currentPassword,
          token: verificationCode || undefined,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setTwoFactorEnabled(false);
      setShow2FASetup(false);
      setTwoFactorSetup(null);
      setVerificationCode("");
      setCurrentPassword("");
      await update();
      await fetchLoginActivity();
      toast.success("2FA disabled successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      await fetchLoginActivity();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmText: deleteConfirmText,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Account deleted. Goodbye!");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  }

  function copyRecoveryCodes() {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied!");
  }

  function getDeviceIcon(deviceType: string) {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
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
                  setShow2FASetup(!show2FASetup);
                  setCurrentPassword("");
                  setVerificationCode("");
                }}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent login and security activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : loginActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {loginActivities.slice(0, 10).map((activity) => (
                  <div
                    key={activity._id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      activity.success ? "bg-muted/30" : "bg-red-50 dark:bg-red-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${activity.success ? "bg-background" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {getDeviceIcon(activity.deviceType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type === "login" 
                            ? activity.success 
                              ? "Successful login" 
                              : `Failed login (${activity.failureReason})`
                            : activity.type === "2fa_enabled"
                            ? "2FA enabled"
                            : activity.type === "2fa_disabled"
                            ? "2FA disabled"
                            : activity.type
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.os} - {activity.browser}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.ipAddress && `IP: ${activity.ipAddress}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {loginActivities.length > 10 && (
                  <Button variant="outline" size="sm" className="w-full" onClick={fetchLoginActivity}>
                    Load More
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            {!showChangePassword ? (
              <Button onClick={() => setShowChangePassword(true)} variant="outline">
                Change Password
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
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
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                  <Button variant="ghost" onClick={() => setShowChangePassword(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive font-medium mb-2">
                    Warning: This action cannot be undone!
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• All your messages will be permanently deleted</li>
                    <li>• All your chats will be removed</li>
                    <li>• Your profile data will be erased</li>
                    <li>• You will lose access to your account immediately</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Enter your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Confirm with your password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount} 
                    disabled={isLoading || deleteConfirmText !== "DELETE" || !deletePassword}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Forever
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteConfirmText("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}