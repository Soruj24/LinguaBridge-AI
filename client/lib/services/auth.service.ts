import {
  registerUser,
  resendVerification,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "@/lib/repositories/auth.repository";

export async function handleRegister(data: {
  name: string;
  email: string;
  password: string;
  preferredLanguage: string;
}) {
  return registerUser(data);
}

export async function handleResendVerification(email: string) {
  if (!email) throw new Error("Email is required");
  return resendVerification(email);
}

export async function handleForgotPassword(email: string) {
  if (!email) throw new Error("Email is required");
  return forgotPassword(email);
}

export async function handleResetPassword(token: string, newPassword: string) {
  if (!token) throw new Error("Reset token is required");
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
  return resetPassword(token, newPassword);
}

export async function handleVerifyEmail(token: string) {
  if (!token) throw new Error("Verification token is required");
  return verifyEmail(token);
}
