import { serverFetch } from "./server-fetch";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  preferredLanguage: string;
}) {
  return serverFetch<{ message?: string; error?: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendVerification(email: string) {
  return serverFetch("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string) {
  return serverFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return serverFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function verifyEmail(token: string) {
  return serverFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
