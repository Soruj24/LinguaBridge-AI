import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { createJSONWebToken } from "../helper/jsonwebtoken";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../helper/cookie";
import { successResponse } from "./responseControllers";
import { IUser, AuthRequest, CreateUserBody } from "../types";
import { env } from "../shared/env";
import User from "../models/User";
import Session from "../models/Session";
import UserActivity from "../models/UserActivity";
import { AUTH_CONSTANTS } from "../constants";
import { checkAccountLockout, createSession, generateAuthTokens, getClientIP, resetLoginAttempts, sanitizeUser, trackFailedLoginAttempt, updateLoginHistory, validateUserStatus, verifyTwoFactorCode } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendVerificationEmail, sendWelcomeEmail } from "../helper/email";
import { notificationService } from "../services/notificationService";

const handleCreateUser = asyncHandler(async (req: Request<{}, {}, CreateUserBody>, res: Response, next: NextFunction) => {
  const body = req.body as any;
  const { email, password, firstName, lastName } = body;
  const username = body.username || (body.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
  const preferredLanguage = body.preferredLanguage || body.userLanguage || "en";
  if (!username || username.length < 3) {
    return next(createError(400, "A valid name or username (min 3 characters) is required"));
  }
  const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
  if (existingUser) {
    let msg = "User already exists";
    if (existingUser.username === username.toLowerCase()) msg = "Username already exists";
    else if (existingUser.email === email.toLowerCase()) msg = "Email already exists";
    return next(createError(400, msg));
  }
  const userIP = getClientIP(req);
  const t = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await User.create({
    username: username.toLowerCase(), email: email.toLowerCase(), password, preferredLanguage, firstName, lastName,
    role: "user", emailVerified: false, emailVerificationToken: t, emailVerificationExpires: new Date(Date.now() + 86400000),
    status: "pending", registrationIP: userIP, detectedCountry: (req.headers["cf-ipcountry"] as string) || undefined,
    metadata: { userAgent: req.get("User-Agent"), ipAddress: userIP, signupFlow: "standard" },
  });
  await UserActivity.create({ userId: user._id, activityType: "account_creation", description: "User account created - Pending verification", ipAddress: userIP, userAgent: req.get("User-Agent"), metadata: { verificationToken: t }, status: "success" });
  try { await sendVerificationEmail(user.email!, user.firstName || user.username, t); } catch (e) { console.error("Email error:", e); }
  return successResponse(res, { statusCode: 201, message: "User created. Please check your email for verification.", payload: { user: sanitizeUser(user as unknown as IUser), requiresVerification: true } });
});

const handleVerifyEmail = asyncHandler(async (req: Request<{}, {}, { token: string; email?: string }>, res: Response, next: NextFunction) => {
  const { token, email } = req.body;
  if (!token) return next(createError(400, "Verification token is required"));
  const query: any = { emailVerificationToken: token, emailVerificationExpires: { $gt: new Date() } };
  if (email) query.email = email.toLowerCase();
  const user = await User.findOne(query);
  if (!user) return next(createError(400, "Invalid or expired verification token"));
  Object.assign(user, { emailVerified: true, emailVerificationToken: undefined, emailVerificationExpires: undefined, emailVerifiedAt: new Date(), status: "active" });
  await user.save();
  try { await sendWelcomeEmail(user.email!, user.firstName || user.username); } catch (e) { console.error("Welcome email error:", e); }
  await UserActivity.create({ userId: user._id, activityType: "email_verified", description: "Email verified", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), status: "success" });
  return successResponse(res, { statusCode: 200, message: "Email verified", payload: { user: sanitizeUser(user as unknown as IUser) } });
});

const handleLogIn = asyncHandler(async (req: Request<{}, {}, { email: string; password: string; twoFactorCode?: string }>, res: Response, next: NextFunction) => {
  const { email, password, twoFactorCode } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(createError(401, "User not found with this Email."));
  checkAccountLockout(user as unknown as IUser);
  try { validateUserStatus(user as unknown as IUser); } catch (error) { return next(error); }
  if (!(await bcrypt.compare(password, user.password || ""))) { await trackFailedLoginAttempt(user as unknown as IUser); return next(createError(401, "Invalid password")); }
  await resetLoginAttempts(user as unknown as IUser);
  if ((user as any).twoFactorAuth?.enabled) {
    if (!twoFactorCode) return successResponse(res, { statusCode: 206, message: "Two-factor authentication required", payload: { requires2FA: true, userId: user.id.toString() } });
    const r = await verifyTwoFactorCode(user as unknown as IUser, twoFactorCode);
    if (!r.isValid) return next(createError(401, `Invalid ${r.isBackupCode ? "backup code" : "authentication code"}`));
  }
  const tokens = generateAuthTokens(user as unknown as IUser);
  const session = await createSession(user.id.toString(), tokens, req);
  await updateLoginHistory(user as unknown as IUser, req);
  await notificationService.sendToUser(user._id as any, { title: "New Login", message: `Login from ${getClientIP(req)}`, type: "info", category: "security", priority: "low" });
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  return successResponse(res, { statusCode: 200, message: "Login successful", payload: { user: { ...sanitizeUser(user as unknown as IUser), ...tokens }, session: { id: session.id.toString(), expiresAt: session.expiresAt } } });
});

const handleRefreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const oldRT = req.cookies.refreshToken;
  if (!oldRT) return next(createError(401, "Refresh token not found"));
  if (!env.JWT_REFRESH_SECRET) return next(createError(500, "JWT refresh key is not defined"));
  try {
    const decoded = jwt.verify(oldRT, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    if (!decoded?.id) return next(createError(401, "Invalid refresh token"));
    const session = await Session.findOne({ refreshToken: oldRT, expiresAt: { $gt: new Date() }, revokedAt: { $exists: false } });
    if (!session) { res.clearCookie("accessToken"); res.clearCookie("refreshToken"); return next(createError(401, "Session expired")); }
    const user = await User.findById(decoded.id);
    if (!user) return next(createError(404, "User not found"));
    const payload = { id: user.id.toString(), email: user.email, role: user.role || "user" };
    const at = createJSONWebToken(payload, env.JWT_ACCESS_SECRET, AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY);
    const rt = createJSONWebToken(payload, env.JWT_REFRESH_SECRET, AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY);
    Object.assign(session, { accessToken: at, refreshToken: rt, lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 604800000) });
    await session.save();
    setAccessTokenCookie(res, at); setRefreshTokenCookie(res, rt);
    return successResponse(res, { statusCode: 200, message: "Tokens refreshed", payload: { accessToken: at, refreshToken: rt } });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.clearCookie("accessToken"); res.clearCookie("refreshToken");
    return next(createError(401, "Invalid refresh token"));
  }
});

const handleProtected = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const at = req.cookies.accessToken || req.headers.authorization?.replace("Bearer ", "");
  if (!at) return next(createError(401, "Access token not found"));
  if (!env.JWT_ACCESS_SECRET) return next(createError(500, "JWT access key is not defined"));
  const decoded = jwt.verify(at, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  if (!decoded?.id) return next(createError(401, "Invalid access token"));
  const user = await User.findById(decoded.id).select("-password");
  if (!user) return next(createError(404, "User not found"));
  if (user.isBanned) return next(createError(403, "Your account has been suspended."));
  return successResponse(res, { statusCode: 200, message: "Protected route accessed", payload: { user } });
});

const handleLogOut = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const at = req.cookies?.accessToken;
  const uid = req.user?._id;
  if (uid && at) await Session.findOneAndUpdate({ userId: uid, accessToken: at }, { revokedAt: new Date(), revokedBy: uid });
  res.clearCookie("accessToken"); res.clearCookie("refreshToken");
  return successResponse(res, { statusCode: 200, message: "User logged out" });
});

const handleSocialLogin = asyncHandler(async (req: Request<{}, {}, { provider: "google" | "github" | "facebook"; providerId: string; email: string; firstName?: string; lastName?: string; avatar?: string; username?: string }>, res: Response, next: NextFunction) => {
  const { provider, providerId, email, firstName, lastName, avatar, username } = req.body;
  const q: any = {}; q[`${provider}Id`] = providerId;
  let user = await User.findOne(q);
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      (user as any)[`${provider}Id`] = providerId;
      if (avatar && !user.avatar?.url) user.avatar = { url: avatar, publicId: `social_${provider}_${providerId}`, uploadedAt: new Date() };
      await user.save();
    } else {
      let uname = (username || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (await User.findOne({ username: uname })) uname += Math.floor(1000 + Math.random() * 9000);
      user = await User.create({
        username: uname, email: email.toLowerCase(), firstName, lastName,
        displayName: firstName && lastName ? `${firstName} ${lastName}` : firstName || uname,
        emailVerified: true, status: "active", [`${provider}Id`]: providerId,
        avatar: avatar ? { url: avatar, publicId: `social_${provider}_${providerId}`, uploadedAt: new Date() } : undefined,
        registrationIP: getClientIP(req), metadata: { userAgent: req.get("User-Agent"), signupFlow: `social_${provider}` },
      });
    }
  }
  checkAccountLockout(user as unknown as IUser);
  validateUserStatus(user as unknown as IUser);
  await resetLoginAttempts(user as unknown as IUser);
  const tokens = generateAuthTokens(user as unknown as IUser);
  const session = await createSession(user.id.toString(), tokens, req);
  await updateLoginHistory(user as unknown as IUser, req);
  setAccessTokenCookie(res, tokens.accessToken); setRefreshTokenCookie(res, tokens.refreshToken);
  return successResponse(res, { statusCode: 200, message: "Login successful", payload: { user: { ...sanitizeUser(user as unknown as IUser), ...tokens }, session: { id: session.id.toString(), expiresAt: session.expiresAt } } });
});

const handleGetMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError(404, "User not found"));
  return successResponse(res, { statusCode: 200, message: "User retrieved", payload: { user: sanitizeUser(req.user) } });
});

export { handleCreateUser, handleVerifyEmail, handleLogIn, handleLogOut, handleSocialLogin, handleRefreshToken, handleProtected, handleGetMe };

