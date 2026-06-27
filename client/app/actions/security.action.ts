"use server";

import {
  handleFetchLoginActivity,
  handleFetch2FAStatus,
  handleSetup2FA,
  handleVerify2FA,
  handleDisable2FA,
  handleChangePassword,
  handleDeleteAccount,
} from "@/lib/services/security.service";
import type { LoginActivity } from "@/types/security";

interface TwoFASetupData {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

interface TwoFAVerifyData {
  recoveryCodes: string[];
}

export async function fetchLoginActivityAction() {
  try {
    const activities = await handleFetchLoginActivity();
    return { success: true, data: activities as LoginActivity[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch login activity";
    return { success: false, error: message, data: [] as LoginActivity[] };
  }
}

export async function fetch2FAStatusAction() {
  try {
    const enabled = await handleFetch2FAStatus();
    return { success: true, data: enabled };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch 2FA status";
    return { success: false, error: message, data: false };
  }
}

export async function setup2FAAction() {
  try {
    const data = await handleSetup2FA();
    return { success: true, data: data as TwoFASetupData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to setup 2FA";
    return { success: false, error: message, data: null as TwoFASetupData | null };
  }
}

export async function verify2FAAction(token: string, secret: string) {
  try {
    const data = await handleVerify2FA(token, secret);
    return { success: true, data: data as TwoFAVerifyData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify 2FA";
    return { success: false, error: message, data: null as TwoFAVerifyData | null };
  }
}

export async function disable2FAAction(password: string, token?: string) {
  try {
    await handleDisable2FA(password, token);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disable 2FA";
    return { success: false, error: message };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  try {
    await handleChangePassword(currentPassword, newPassword, confirmPassword);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password";
    return { success: false, error: message };
  }
}

export async function deleteAccountAction(password: string, confirmText: string) {
  try {
    await handleDeleteAccount(password, confirmText);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    return { success: false, error: message };
  }
}
