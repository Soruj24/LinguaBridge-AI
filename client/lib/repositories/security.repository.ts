import { serverFetch } from "./server-fetch";

export async function fetchLoginActivity() {
  return serverFetch("/api/auth/login-activity");
}

export async function fetch2FAStatus() {
  return serverFetch<{ enabled: boolean }>("/api/auth/2fa/setup");
}

export async function setup2FA() {
  return serverFetch("/api/auth/2fa/setup", { method: "POST" });
}

export async function verify2FA(token: string, secret: string) {
  return serverFetch<{ recoveryCodes: string[] }>("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ token, secret }),
  });
}

export async function disable2FA(password: string, token?: string) {
  return serverFetch("/api/auth/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ password, token }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return serverFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function deleteAccount(password: string, confirmText: string) {
  return serverFetch("/api/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ password, confirmText }),
  });
}
