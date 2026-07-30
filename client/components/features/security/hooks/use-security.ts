"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import type { LoginActivity, TwoFactorSetupData } from "@/types/shared";
import {
  fetchLoginActivityAction,
  fetch2FAStatusAction,
  setup2FAAction,
  verify2FAAction,
  disable2FAAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/app/actions/security.action";

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
    const result = await fetchLoginActivityAction();
    if (result.success) {
      setLoginActivities(result.data);
    }
    setActivitiesLoading(false);
  }, []);

  const fetch2FAStatus = useCallback(async () => {
    const result = await fetch2FAStatusAction();
    if (result.success && typeof result.data === "boolean") {
      setTwoFactorEnabled(result.data);
    }
  }, []);

  useEffect(() => {
    fetch2FAStatus();
    fetchLoginActivity();
  }, [fetch2FAStatus, fetchLoginActivity]);

  async function handleSetup2FA() {
    setIsLoading(true);
    const result = await setup2FAAction();
    if (result.success) {
      setTwoFactorSetup(result.data as TwoFactorSetupData);
      setShow2FASetup(true);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  async function handleVerify2FA() {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    if (!twoFactorSetup?.secret) return;
    setIsLoading(true);
    const result = await verify2FAAction(verificationCode, twoFactorSetup.secret);
    if (result.success) {
      const data = result.data as { recoveryCodes: string[] };
      setRecoveryCodes(data.recoveryCodes);
      setShowRecoveryCodes(true);
      setTwoFactorEnabled(true);
      await update();
      await fetchLoginActivity();
      toast.success("2FA enabled successfully!");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  async function handleDisable2FA() {
    setIsLoading(true);
    const result = await disable2FAAction(currentPassword, verificationCode || undefined);
    if (result.success) {
      setTwoFactorEnabled(false);
      setShow2FASetup(false);
      setTwoFactorSetup(null);
      setVerificationCode("");
      setCurrentPassword("");
      await update();
      await fetchLoginActivity();
      toast.success("2FA disabled successfully");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  async function handleChangePassword() {
    setIsLoading(true);
    const result = await changePasswordAction(currentPassword, newPassword, confirmPassword);
    if (result.success) {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      await fetchLoginActivity();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  async function handleDeleteAccount() {
    setIsLoading(true);
    const result = await deleteAccountAction(deletePassword, deleteConfirmText);
    if (result.success) {
      toast.success("Account deleted. Goodbye!");
      await signOut({ callbackUrl: "/" });
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
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
