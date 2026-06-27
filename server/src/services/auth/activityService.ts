import connectDB from "../../config/connectDB";
import { LoginActivity } from "../../models/chat";

export interface LoginActivityParams {
  userId?: string;
  email: string;
  userAgent?: string;
  type: "login" | "logout" | "signup" | "password_change" | "2fa_enabled" | "2fa_disabled";
  success: boolean;
  failureReason?: string;
  provider?: "credentials" | "google" | "github" | "apple";
}

export function parseUserAgent(userAgent: string): {
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();

  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "unknown";
  let browser = "Unknown";
  let os = "Unknown";

  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    deviceType = "desktop";
  }

  if (/edge\/([\d.]+)/i.test(ua)) {
    browser = "Edge";
  } else if (/opr\/([\d.]+)/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome\/([\d.]+)/i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox\/([\d.]+)/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari\/([\d.]+)/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/msie|trident/i.test(ua)) {
    browser = "Internet Explorer";
  }

  if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  }

  return { deviceType, browser, os };
}

export async function logLoginActivity(params: LoginActivityParams) {
  try {
    await connectDB();

    const deviceInfo = params.userAgent
      ? parseUserAgent(params.userAgent)
      : { deviceType: "unknown" as const, browser: "Unknown", os: "Unknown" };

    await LoginActivity.create({
      userId: params.userId,
      email: params.email,
      userAgent: params.userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      type: params.type,
      success: params.success,
      failureReason: params.failureReason,
      provider: params.provider,
    });
  } catch (error) {
    console.error("Failed to log login activity:", error);
  }
}
