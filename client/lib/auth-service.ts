import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION } from "@/lib/email-templates";
import LoginActivity from "@/models/LoginActivity";
import { parseUserAgent } from "@/lib/user-agent";
import type { LoginActivityParams } from "@/types/auth";

export async function getUser(email: string) {
  try {
    await connectDB();
    return await User.findOne({ email });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function getOrCreateUser({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || "User",
      email,
      avatar: image,
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0,
    });
  } else if (image && !user.avatar) {
    user.avatar = image;
    await user.save();
  }

  return user;
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authorizeCredentials(
  credentials: Record<string, unknown> | undefined,
  userAgent?: string,
) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;
  const user = await getUser(email);

  if (!user) {
    await logLoginActivity({
      email,
      userAgent,
      type: "login",
      success: false,
      failureReason: "User not found",
      provider: "credentials",
    });
    return null;
  }

  if (user.isActive === false) {
    await logLoginActivity({
      userId: user._id.toString(),
      email,
      userAgent,
      type: "login",
      success: false,
      failureReason: "Account disabled",
      provider: "credentials",
    });
    return null;
  }

  const isLocked = user.lockUntil && new Date() < user.lockUntil;
  if (isLocked) {
    await logLoginActivity({
      userId: user._id.toString(),
      email,
      userAgent,
      type: "login",
      success: false,
      failureReason: "Account locked",
      provider: "credentials",
    });
    return null;
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) {
    const attempts = (user.loginAttempts || 0) + 1;
    const updateData: Record<string, unknown> = { loginAttempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
    }

    await User.updateOne({ _id: user._id }, updateData);

    await logLoginActivity({
      userId: user._id.toString(),
      email,
      userAgent,
      type: "login",
      success: false,
      failureReason: `Invalid password (attempt ${attempts}/${MAX_LOGIN_ATTEMPTS})`,
      provider: "credentials",
    });

    return null;
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  await logLoginActivity({
    userId: user._id.toString(),
    email,
    userAgent,
    type: "login",
    success: true,
    provider: "credentials",
  });

  return user;
}
