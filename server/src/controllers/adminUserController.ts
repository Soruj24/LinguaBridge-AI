import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import { IUser, AuthRequest, GetUsersQuery } from "../types";
import { UserRole } from "../models/interfaces/IUser";
import User from "../models/schemas/User";
import Session from "../models/Session";
import UserActivity from "../models/UserActivity";
import { sanitizeUser, getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendAdminToUserEmail } from "../helper/email";

const handleGetAllUsers = asyncHandler(async (req: Request<{}, {}, {}, GetUsersQuery>, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1, limit = Number(req.query.limit) || 10;
  const { role, status, isBanned } = req.query as any;
  const filter: any = { role: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, $or: [] };
  if (req.query.search) {
    const r = new RegExp(".*" + req.query.search + ".*", "i");
    filter.$or = [{ firstName: { $regex: r } }, { lastName: { $regex: r } }, { email: { $regex: r } }, { username: { $regex: r } }];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (isBanned !== undefined) filter.isBanned = isBanned === "true";
  const [users, count] = await Promise.all([User.find(filter, { password: 0, __v: 0 }).limit(limit).skip((page - 1) * limit).sort({ createdAt: -1 }), User.countDocuments(filter)]);
  if (!users?.length) return next(createError(404, "No users found"));
  return successResponse(res, { statusCode: 200, message: "Users returned", payload: { users: users.map((u) => sanitizeUser(u as unknown as IUser)), totalUsers: count, pagination: { totalPage: Math.ceil(count / limit), currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page < Math.ceil(count / limit) ? page + 1 : null } } });
});

const handleGetUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -twoFactorSecret -refreshToken -resetPasswordToken");
    if (!user) return next(createError(404, "User not found"));
    return successResponse(res, { statusCode: 200, message: "User retrieved", payload: { user } });
  } catch (e) { return next(createError(500, "Failed to retrieve user")); }
});

const handleDeleteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, adminId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    if (user.status === 'deleted' || userId === adminId.toString()) return next(createError(400, user.status === 'deleted' ? "User already deleted" : "Cannot delete your own account"));
    if (user.role === 'super_admin') return next(createError(403, "Cannot delete super admin"));
    const p = `deleted_${user._id}_`;
    Object.assign(user, { deletedAt: new Date(), status: 'deleted', deletedBy: adminId });
    if (user.email && !user.email.startsWith(p)) user.email = `${p}${user.email}`;
    if (!user.username.startsWith(p)) user.username = `${p}${user.username}`;
    await user.save();
    await Promise.all([Session.updateMany({ userId }, { revokedAt: new Date(), revokedBy: adminId, revocationReason: 'deleted_by_admin' }), UserActivity.create({ userId: adminId, activityType: 'admin_user_deleted', description: `Deleted: ${user.email}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { deletedUserId: userId }, status: "success" })]);
    return successResponse(res, { statusCode: 200, message: "User deleted" });
  } catch (e) { return next(createError(500, "Failed to delete user")); }
});

const handleUpdateUserRole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, { role } = req.body, adminId = req.user!._id;
    if (!['user', 'admin', 'moderator', 'super_admin'].includes(role)) return next(createError(400, "Invalid role"));
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    if (userId === adminId.toString()) return next(createError(400, "Cannot change your own role"));
    if ((role === 'super_admin' || user.role === 'super_admin') && req.user!.role !== 'super_admin') return next(createError(403, "Only super admin can modify super admin roles"));
    const oldRole = user.role; user.role = role; await user.save();
    await UserActivity.create([{ userId: adminId, activityType: 'admin_role_changed', description: `Changed ${user.email} role: ${oldRole}->${role}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { targetUserId: userId, oldRole, newRole: role }, status: "success" }, { userId, activityType: 'role_changed', description: `Your role changed to ${role}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { changedBy: adminId, oldRole, newRole: role }, status: "info" }]);
    return successResponse(res, { statusCode: 200, message: "Role updated", payload: { user: sanitizeUser(user as unknown as IUser), roleChange: { oldRole, newRole: role } } });
  } catch (e) { return next(createError(500, "Failed to update role")); }
});

const handleSendEmailToUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, { subject, message } = req.body, admin = req.user!;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    const r = await sendAdminToUserEmail(`${admin.firstName} ${admin.lastName}`, admin.email!, user.email!, `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username, subject, message);
    if (!r.success) return next(createError(500, "Failed to send email"));
    await UserActivity.create([{ userId: admin._id, activityType: 'admin_email_sent', description: `Sent email to ${user.email}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { targetUserId: userId, subject }, status: "success" }, { userId, activityType: 'admin_email_received', description: `Email from admin`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { sentBy: admin._id, sentByName: `${admin.firstName} ${admin.lastName}`, subject }, status: "info" }]);
    return successResponse(res, { statusCode: 200, message: "Email sent", payload: { sentTo: user.email, subject, messageId: r.messageId, timestamp: new Date().toISOString() } });
  } catch (e: any) { return next(createError(500, "Failed to send email: " + e.message)); }
});

const handleUpdateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, updates = req.body, adminId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    if (userId === adminId.toString()) return next(createError(400, "Use profile endpoint for your own account"));
    if (user.role === 'super_admin' && req.user!.role !== 'super_admin') return next(createError(403, "Only super admin can modify other super admins"));
    if (updates.role === 'super_admin' && req.user!.role !== 'super_admin') return next(createError(403, "Only super admin can assign super_admin role"));
    const orig = { firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, role: user.role, isActive: user.isActive, isBanned: user.isBanned, status: (user as any).status };
    ['firstName', 'lastName', 'email', 'username', 'role', 'permissions', 'isActive', 'isBanned', 'status'].forEach(f => { if (updates[f] !== undefined) (user as any)[f] = updates[f]; });
    if (updates.email && updates.email !== orig.email) Object.assign(user, { emailVerified: false, emailVerificationToken: Math.floor(100000 + Math.random() * 900000).toString(), emailVerificationExpires: new Date(Date.now() + 86400000) });
    await user.save();
    const changes = Object.entries(updates).filter(([k, v]) => v !== (orig as any)[k]).map(([field, newValue]) => ({ field, oldValue: (orig as any)[field], newValue }));
    if (changes.length) await UserActivity.create({ userId: adminId, activityType: 'admin_user_updated', description: `Updated: ${user.email}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { targetUserId: userId, changes }, status: "success" });
    return successResponse(res, { statusCode: 200, message: "User updated", payload: { user: sanitizeUser(user as unknown as IUser), changes: changes.length ? changes : undefined } });
  } catch (e) { return next(createError(500, "Failed to update user")); }
});

const handleAdminCreateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName, role = 'user', permissions = [] } = req.body;
    const adminId = req.user!._id;
    const existing = await User.findOne({ $or: [{ username: username?.toLowerCase() }, { email: email.toLowerCase() }] });
    if (existing) {
      let msg = "User already exists";
      if (existing.username === username?.toLowerCase()) msg = "Username already exists";
      else if (existing.email === email.toLowerCase()) msg = "Email already exists";
      return next(createError(400, msg));
    }
    if (role === 'super_admin' && req.user!.role !== 'super_admin') return next(createError(403, "Only super admin can create super admin accounts"));
    const t = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({ username: username?.toLowerCase() || email.split('@')[0], email: email.toLowerCase(), password, firstName, lastName, role, permissions, emailVerified: false, emailVerificationToken: t, emailVerificationExpires: new Date(Date.now() + 86400000), status: "active", registrationIP: getClientIP(req as unknown as Request), createdBy: adminId, metadata: { userAgent: req.get("User-Agent"), ipAddress: getClientIP(req as unknown as Request), signupFlow: "admin_created", createdByAdmin: adminId } });
    await UserActivity.create({ userId: adminId, activityType: 'admin_user_created', description: `Created user: ${user.email} (${role})`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { createdUserId: user._id, role, createdByName: `${req.user!.firstName} ${req.user!.lastName}` }, status: "success" });
    return successResponse(res, { statusCode: 201, message: "User created", payload: { user: sanitizeUser(user as unknown as IUser), verificationToken: process.env.NODE_ENV === 'development' ? t : undefined } });
  } catch (e) { return next(createError(500, "Failed to create user")); }
});

const handleAdminToggleTwoFactor = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, adminId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    if (userId === adminId.toString()) return next(createError(400, "Use security settings for your own account"));
    if (!(user as any).twoFactorAuth?.enabled) return next(createError(400, "Admins can only disable 2FA"));
    (user as any).twoFactorAuth = { enabled: false, secret: undefined, backupCodes: [] }; await user.save();
    await UserActivity.create({ userId: adminId, activityType: "admin_2fa_toggled", description: `Disabled 2FA for ${user.email}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { targetUserId: userId }, status: "success" });
    return successResponse(res, { statusCode: 200, message: `2FA disabled for ${user.email}`, payload: { twoFactorEnabled: false } });
  } catch (e) { return next(e); }
});

const handleAdminRevokeAllSessions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params, adminId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    await Promise.all([Session.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date(), revokedBy: adminId, revocationReason: "revoked_by_admin" }), UserActivity.create({ userId: adminId, activityType: "admin_sessions_revoked", description: `Revoked sessions for ${user.email}`, ipAddress: getClientIP(req as unknown as Request), userAgent: req.get("User-Agent"), metadata: { targetUserId: userId }, status: "success" })]);
    return successResponse(res, { statusCode: 200, message: `Sessions revoked for ${user.email}` });
  } catch (e) { return next(e); }
});

export { handleGetAllUsers, handleGetUser, handleDeleteUser, handleUpdateUserRole, handleSendEmailToUser, handleUpdateUser, handleAdminCreateUser, handleAdminToggleTwoFactor, handleAdminRevokeAllSessions };
