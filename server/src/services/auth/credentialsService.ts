import { ChatUser } from "../../models/chat";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUser } from "./userService";
import { logLoginActivity } from "./activityService";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

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

    await ChatUser.updateOne({ _id: user._id }, updateData);

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
