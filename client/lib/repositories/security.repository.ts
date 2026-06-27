const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

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
