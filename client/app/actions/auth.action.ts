"use server";

import {
  handleRegister,
  handleResendVerification,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
} from "@/lib/services/auth.service";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  preferredLanguage: string;
}) {
  try {
    const result = await handleRegister(data);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return { success: false, error: message };
  }
}

export async function resendVerificationAction(email: string) {
  try {
    await handleResendVerification(email);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resend verification";
    return { success: false, error: message };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    await handleForgotPassword(email);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    return { success: false, error: message };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    await handleResetPassword(token, newPassword);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return { success: false, error: message };
  }
}

export async function verifyEmailAction(token: string) {
  try {
    await handleVerifyEmail(token);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify email";
    return { success: false, error: message };
  }
}
