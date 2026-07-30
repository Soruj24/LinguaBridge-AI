import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { createJSONWebToken } from "../helper/jsonwebtoken";
import { successResponse } from "./responseControllers";
import { AuthRequest, PasswordChangeBody, UserParams } from "../types";
import { env } from "../shared/env";
import User from "../models/User";
import Session from "../models/Session";
import UserActivity from "../models/UserActivity";
import { findUser } from "../services/userServices";
import { AUTH_CONSTANTS } from "../constants";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendPasswordResetEmail, sendVerificationEmail } from "../helper/email";

const handleChangedPassword = asyncHandler(async (req: Request<UserParams, {}, PasswordChangeBody>, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req.params;
  if (!oldPassword || !newPassword) return next(createError(400, "Old and new passwords are required"));
  const user = await findUser(userId);
  if (!(await bcrypt.compare(oldPassword, user?.password || ""))) return next(createError(401, "Old password is incorrect"));
  if (await bcrypt.compare(newPassword, user.password || "")) return next(createError(400, "New password cannot be the same as the old password"));
  try {
    user.password = newPassword;
    (user as any).passwordChangedAt = new Date();
    await user.save();
    await Session.updateMany({ userId }, { revokedAt: new Date(), revokedBy: userId, revocationReason: "password_changed" });
    await UserActivity.create({ userId, activityType: "password_changed", description: "Password changed", ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), status: "success" });
    return successResponse(res, { statusCode: 200, message: "Password changed successfully" });
  } catch (error: any) {
    if (error.name === "ValidationError") return next(createError(400, Object.values(error.errors).map((e: any) => e.message).join(", ")));
    return next(error);
  }
});

const handleForgotPassword = asyncHandler(async (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return next(createError(400, "Email is required"));
  const user = await User.findOne({ email });
  if (!user) return successResponse(res, { statusCode: 200, message: "If the email exists, a password reset link has been sent" });
  const resetToken = createJSONWebToken({ userId: user._id, type: "password_reset" }, env.JWT_ACCESS_SECRET, AUTH_CONSTANTS.RESET_TOKEN_EXPIRY);
  Object.assign(user, { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 3600000) });
  await user.save();
  try { await sendPasswordResetEmail(user.email!, user.firstName || user.username, resetToken); } catch (e) { console.error("Password reset email error:", e); }
  return successResponse(res, { statusCode: 200, message: "If the email exists, a password reset link has been sent", payload: { resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined } });
});

const handleResetPassword = asyncHandler(async (req: Request<{}, {}, { token: string; newPassword: string }>, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return next(createError(400, "Token and new password are required"));
  let decoded: jwt.JwtPayload;
  try { decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload; } catch (e) { return next(createError(400, "Invalid or expired reset token")); }
  if (decoded?.type !== "password_reset") return next(createError(400, "Invalid or expired reset token"));
  const user = await User.findOne({ _id: decoded.userId, resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
  if (!user) return next(createError(400, "Invalid or expired reset token"));
  Object.assign(user, { password: newPassword, resetPasswordToken: undefined, resetPasswordExpires: undefined, passwordChangedAt: new Date() });
  await user.save();
  await Session.updateMany({ userId: user._id }, { revokedAt: new Date(), revokedBy: user._id });
  return successResponse(res, { statusCode: 200, message: "Password reset successfully" });
});

const handleSendVerificationEmail = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);
  if (!user) return next(createError(404, "User not found"));
  if (user.emailVerified) return next(createError(400, "Email is already verified"));
  const t = Math.floor(100000 + Math.random() * 900000).toString();
  Object.assign(user, { emailVerificationToken: t, emailVerificationExpires: new Date(Date.now() + 86400000) });
  await user.save();
  const r = await sendVerificationEmail(user.email!, user.firstName || user.username, t);
  if (!r.success) return next(createError(500, "Failed to send verification email"));
  return successResponse(res, { statusCode: 200, message: "Verification email sent", payload: { verificationToken: process.env.NODE_ENV === "development" ? t : undefined } });
});

const handleResendVerificationEmail = asyncHandler(async (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return next(createError(400, "Email is required"));
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return successResponse(res, { statusCode: 200, message: "If the email exists, a verification email has been sent" });
  if (user.emailVerified) return next(createError(400, "Email is already verified"));
  const t = Math.floor(100000 + Math.random() * 900000).toString();
  Object.assign(user, { emailVerificationToken: t, emailVerificationExpires: new Date(Date.now() + 86400000) });
  await user.save();
  try { await sendVerificationEmail(user.email!, user.firstName || user.username, t); } catch (e) { return next(createError(500, "Failed to send verification email")); }
  return successResponse(res, { statusCode: 200, message: "Verification email sent", payload: { verificationToken: process.env.NODE_ENV === "development" ? t : undefined } });
});

const handleDeleteAccount = asyncHandler(async (req: Request<{}, {}, { password: string }>, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const userId = (req as AuthRequest).user!._id;
  if (!password) return next(createError(400, "Password is required"));
  const user = await User.findById(userId).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password || ""))) return next(createError(401, "Invalid credentials"));
  Object.assign(user, { deletedAt: new Date(), status: "deleted", email: `deleted_${user._id}_${user.email}`, username: `deleted_${user._id}_${user.username}` });
  await user.save();
  await Session.updateMany({ userId }, { revokedAt: new Date(), revokedBy: userId });
  res.clearCookie("accessToken"); res.clearCookie("refreshToken");
  return successResponse(res, { statusCode: 200, message: "Account deleted" });
});

const handleDeactivateAccount = asyncHandler(async (req: Request<{}, {}, { password: string }>, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const userId = (req as AuthRequest).user!._id;
  if (!password) return next(createError(400, "Password is required"));
  const user = await User.findById(userId).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password || ""))) return next(createError(401, "Invalid credentials"));
  Object.assign(user, { status: "deactivated", deactivatedAt: new Date() });
  await user.save();
  await Session.updateMany({ userId }, { revokedAt: new Date(), revokedBy: userId });
  res.clearCookie("accessToken"); res.clearCookie("refreshToken");
  return successResponse(res, { statusCode: 200, message: "Account deactivated" });
});

const handleReactivateAccount = asyncHandler(async (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return next(createError(400, "Email is required"));
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(createError(404, "No deactivated account found with this email"));
  Object.assign(user, { status: "active", deactivatedAt: undefined });
  await user.save();
  return successResponse(res, { statusCode: 200, message: "Account reactivated. You can now log in." });
});

const handleUpdateEmail = asyncHandler(async (req: Request<{}, {}, { newEmail: string; password: string }>, res: Response, next: NextFunction) => {
  const { newEmail, password } = req.body;
  const userId = (req as AuthRequest).user!._id;
  if (!newEmail || !password) return next(createError(400, "New email and password are required"));
  const user = await User.findById(userId).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password || ""))) return next(createError(401, "Invalid credentials"));
  if (await User.findOne({ email: newEmail.toLowerCase() })) return next(createError(400, "Email is already taken"));
  const t = Math.floor(100000 + Math.random() * 900000).toString();
  Object.assign(user, { email: newEmail.toLowerCase(), emailVerified: false, emailVerificationToken: t, emailVerificationExpires: new Date(Date.now() + 86400000) });
  await user.save();
  try {
    const r = await sendVerificationEmail(user.email!, user.firstName || user.username, t);
    if (!r.success) return successResponse(res, { statusCode: 200, message: "Email updated but failed to send verification. Please resend from profile.", payload: { email: newEmail, emailVerified: false } });
  } catch (e) { console.error("Verification email error:", e); }
  return successResponse(res, { statusCode: 200, message: "Email updated. Please verify.", payload: { email: newEmail, emailVerified: false, verificationToken: process.env.NODE_ENV === "development" ? t : undefined } });
});

const handleCheckUsernameAvailability = asyncHandler(async (req: Request<{}, {}, {}, { username: string }>, res: Response, next: NextFunction) => {
  const { username } = req.query;
  if (!username) return next(createError(400, "Username is required"));
  const existing = await User.findOne({ username: username.toLowerCase() });
  return successResponse(res, { statusCode: 200, message: "Username check", payload: { available: !existing, username } });
});

const handleCheckEmailAvailability = asyncHandler(async (req: Request<{}, {}, {}, { email: string }>, res: Response, next: NextFunction) => {
  const { email } = req.query;
  if (!email) return next(createError(400, "Email is required"));
  const existing = await User.findOne({ email: email.toLowerCase() });
  return successResponse(res, { statusCode: 200, message: "Email check", payload: { available: !existing, email } });
});

export { handleChangedPassword, handleForgotPassword, handleResetPassword, handleSendVerificationEmail, handleResendVerificationEmail, handleDeleteAccount, handleDeactivateAccount, handleReactivateAccount, handleUpdateEmail, handleCheckUsernameAvailability, handleCheckEmailAvailability };

