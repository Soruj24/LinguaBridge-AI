import { IUser } from "../types";
import { createJSONWebToken } from "../helper/jsonwebtoken";
import { env } from "../shared/env";
import { AUTH_CONSTANTS } from "../constants";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import User from "../models/schemas/User";

export const verifyTwoFactorCode = async (
  user: IUser,
  twoFactorCode: string
): Promise<{ isValid: boolean; isBackupCode: boolean }> => {
  if (!user.twoFactorAuth?.enabled || !(user.twoFactorAuth as any)?.secret) {
    return { isValid: false, isBackupCode: false };
  }

  const isValidTOTP = speakeasy.totp.verify({
    secret: (user.twoFactorAuth as any).secret,
    encoding: "base32",
    token: twoFactorCode,
    window: 2,
  });

  if (isValidTOTP) {
    return { isValid: true, isBackupCode: false };
  }

  if ((user.twoFactorAuth as any)?.backupCodes) {
    for (let i = 0; i < (user.twoFactorAuth as any).backupCodes.length; i++) {
      const match = await bcrypt.compare(
        twoFactorCode,
        (user.twoFactorAuth as any).backupCodes[i]
      );
      if (match) {
        (user.twoFactorAuth as any).backupCodes.splice(i, 1);
        await User.findByIdAndUpdate(user._id, {
          twoFactorAuth: user.twoFactorAuth,
        });
        return { isValid: true, isBackupCode: true };
      }
    }
  }

  return { isValid: false, isBackupCode: false };
};

export const generateAuthTokens = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    throw new Error("JWT keys not configured");
  }
  const tokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: (user as any).role || "user",
    username: user.username,
  };

  const accessToken = createJSONWebToken(
    tokenPayload,
    env.JWT_ACCESS_SECRET,
    AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY
  );
  const refreshToken = createJSONWebToken(
    tokenPayload,
    env.JWT_REFRESH_SECRET,
    AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY
  );

  return { accessToken, refreshToken };
};
