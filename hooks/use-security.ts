"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import type { LoginActivity, TwoFactorSetupData } from "@/types/security";

export function useSecurity() {
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
    user?: { email?: string; name?: string; isEmailVerified?: boolean };
  } | null;

  const userEmail = typedSession?.user?.email || "";
  const emailVerified = typedSession?.user?.isEmailVerified || false;

  const fetchLoginActivity = useCallback(async () => {
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
  }, []);

  const fetch2FAStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup");
      const data = await res.json();
      setTwoFactorEnabled(data.enabled);
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    }
  }, []);

  useEffect(() => {
    fetch2FAStatus();
    fetchLoginActivity();
  }, [fetch2FAStatus, fetchLoginActivity]);

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
        body: JSON.stringify({ token: verificationCode, secret: twoFactorSetup?.secret }),
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
        body: JSON.stringify({ password: currentPassword, token: verificationCode || undefined }),
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
        body: JSON.stringify({ currentPassword, newPassword }),
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
        body: JSON.stringify({ password: deletePassword, confirmText: deleteConfirmText }),
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

  return {
    isLoading,
    showChangePassword, setShowChangePassword,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    twoFactorEnabled,
    show2FASetup, setShow2FASetup,
    twoFactorSetup, setTwoFactorSetup,
    verificationCode, setVerificationCode,
    recoveryCodes, showRecoveryCodes, setShowRecoveryCodes,
    showDeleteConfirm, setShowDeleteConfirm,
    deleteConfirmText, setDeleteConfirmText,
    loginActivities, activitiesLoading,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    deletePassword, setDeletePassword,
    userEmail, emailVerified,
    handleSetup2FA, handleVerify2FA, handleDisable2FA,
    handleChangePassword, handleDeleteAccount,
    copyRecoveryCodes, fetchLoginActivity,
  };
}
