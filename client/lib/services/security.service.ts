import {
  fetchLoginActivity,
  fetch2FAStatus,
  setup2FA,
  verify2FA,
  disable2FA,
  changePassword,
  deleteAccount,
} from "@/lib/repositories/security.repository";
import type { LoginActivity } from "@/types/shared";

interface LoginActivityResponse {
  payload?: { sessions?: LoginActivity[] };
  sessions?: LoginActivity[];
}

interface TwoFASetupResponse {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

interface TwoFAVerifyResponse {
  recoveryCodes: string[];
}

export async function handleFetchLoginActivity(): Promise<LoginActivity[]> {
  const data = (await fetchLoginActivity()) as LoginActivityResponse;
  return data.payload?.sessions || data.sessions || [];
}

export async function handleFetch2FAStatus(): Promise<boolean> {
  const data = await fetch2FAStatus();
  return data.enabled;
}

export async function handleSetup2FA(): Promise<TwoFASetupResponse> {
  return setup2FA() as Promise<TwoFASetupResponse>;
}

export async function handleVerify2FA(
  token: string,
  secret: string,
): Promise<TwoFAVerifyResponse> {
  if (token.length !== 6) throw new Error("Please enter a 6-digit code");
  return verify2FA(token, secret) as Promise<TwoFAVerifyResponse>;
}

export async function handleDisable2FA(password: string, token?: string) {
  if (!password) throw new Error("Please enter your password");
  return disable2FA(password, token);
}

export async function handleChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  return changePassword(currentPassword, newPassword);
}

export async function handleDeleteAccount(password: string, confirmText: string) {
  if (confirmText !== "DELETE") throw new Error('Type "DELETE" to confirm');
  return deleteAccount(password, confirmText);
}
