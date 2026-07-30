import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import createError from "http-errors";

import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import User from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";

const handleSetupTwoFactor = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    if ((user as any).twoFactorAuth?.enabled) return next(createError(400, "Two-factor authentication is already enabled"));
    const secret = speakeasy.generateSecret({ name: `YourApp (${user.email})`, issuer: "YourApp", length: 20 });
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
    const otpauthUrl = secret.otpauth_url;
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 12)));
    (user as any).twoFactorAuth = { secret: secret.base32, backupCodes: hashedBackupCodes, enabled: false, setupAt: new Date() };
    await user.save();
    let qrCodeDataUrl = "";
    if (otpauthUrl) qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return successResponse(res, {
      statusCode: 200, message: "Two-factor authentication setup initiated",
      payload: { qrCodeUrl: qrCodeDataUrl, secret: process.env.NODE_ENV === "development" ? secret.base32 : undefined, backupCodes: process.env.NODE_ENV === "development" ? backupCodes : undefined },
    });
  }
);

const handleVerifyTwoFactor = asyncHandler(
  async (req: Request<{}, {}, { code: string }>, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const userId = (req as AuthRequest).user!._id;
    if (!code) return next(createError(400, "Verification code is required"));
    const user = await User.findById(userId);
    if (!user || !(user as any).twoFactorAuth?.secret) return next(createError(400, "Two-factor authentication not set up"));
    const isValid = speakeasy.totp.verify({ secret: (user as any).twoFactorAuth.secret, encoding: "base32", token: code, window: 2 });
    let usedBackupCode = false;
    if (!isValid && (user as any).twoFactorAuth.backupCodes) {
      for (let i = 0; i < (user as any).twoFactorAuth.backupCodes.length; i++) {
        const match = await bcrypt.compare(code, (user as any).twoFactorAuth.backupCodes[i]);
        if (match) { usedBackupCode = true; (user as any).twoFactorAuth.backupCodes.splice(i, 1); break; }
      }
    }
    if (!isValid && !usedBackupCode) return next(createError(400, "Invalid verification code"));
    (user as any).twoFactorAuth.enabled = true;
    (user as any).twoFactorAuth.enabledAt = new Date();
    await user.save();
    return successResponse(res, { statusCode: 200, message: "Two-factor authentication enabled successfully", payload: { backupCodesRemaining: (user as any).twoFactorAuth.backupCodes.length, usedBackupCode } });
  }
);

const handleDisableTwoFactor = asyncHandler(
  async (req: Request<{}, {}, { password: string }>, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const userId = (req as AuthRequest).user!._id;
    if (!password) return next(createError(400, "Password is required to disable two-factor authentication"));
    const user = await User.findById(userId).select("+password");
    if (!user) return next(createError(404, "User not found"));
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) return next(createError(401, "Invalid password"));
    (user as any).twoFactorAuth = { enabled: false, secret: undefined, backupCodes: [] };
    await user.save();
    return successResponse(res, { statusCode: 200, message: "Two-factor authentication disabled successfully" });
  }
);

const handleGenerateBackupCodes = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user || !(user as any).twoFactorAuth?.enabled) return next(createError(400, "Two-factor authentication is not enabled"));
    const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 10)));
    (user as any).twoFactorAuth.backupCodes = hashedBackupCodes;
    await user.save();
    return successResponse(res, { statusCode: 200, message: "New backup codes generated successfully", payload: { backupCodes: process.env.NODE_ENV === "development" ? backupCodes : undefined } });
  }
);

export {
  handleSetupTwoFactor, handleVerifyTwoFactor,
  handleDisableTwoFactor, handleGenerateBackupCodes,
};

