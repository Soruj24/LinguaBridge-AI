import { Request } from "express";
import Session from "../models/Session";
import User from "../models/schemas/User";
import { IUser } from "../types";
import { getClientIP } from "./ip";
import { getDeviceInfo } from "./device";

export const updateLoginHistory = async (
  user: IUser,
  req: Request
): Promise<void> => {
  (user as any).lastLogin = new Date();
  (user as any).loginHistory = (user as any).loginHistory || [];

  (user as any).loginHistory.push({
    ipAddress: getClientIP(req),
    userAgent: req.get("User-Agent") || "Unknown",
    timestamp: new Date(),
    deviceInfo: getDeviceInfo(req),
  });

  if ((user as any).loginHistory.length > 10) {
    (user as any).loginHistory = (user as any).loginHistory.slice(-10);
  }

  await User.findByIdAndUpdate(user._id, {
    lastLogin: (user as any).lastLogin,
    loginHistory: (user as any).loginHistory,
  });
};

export const createSession = async (
  userId: string,
  tokens: { accessToken: string; refreshToken: string },
  req: Request
): Promise<any> => {
  const session = new Session({
    userId,
    ...tokens,
    userAgent: req.get("User-Agent") || "Unknown",
    ipAddress: getClientIP(req),
    deviceInfo: getDeviceInfo(req),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await session.save();
  return session;
};

export const generateSixDigitToken = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
