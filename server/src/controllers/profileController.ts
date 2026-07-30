import { Response, NextFunction } from "express";
import createError from "http-errors";

import { successResponse } from "./responseControllers";
import { IUser, AuthRequest } from "../types";
import User from "../models/User";
import { sanitizeUser } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import cloudinary from "../config/cloudinary";

const handleUpdateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const updates = req.body;
    const restrictedFields = ["password", "email", "role", "isAdmin", "status", "permissions"];
    restrictedFields.forEach((field) => delete updates[field]);
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return next(createError(404, "User not found"));
    return successResponse(res, { statusCode: 200, message: "Profile updated successfully", payload: { user: sanitizeUser(user as unknown as IUser) } });
  }
);

const handleUploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.file) throw createError(400, "No file uploaded");
    const userId = req.user!._id;
    try {
      const result: any = await uploadToCloudinary(req.file.buffer, "avatars");
      const user = await User.findById(userId);
      if (!user) throw createError(404, "User not found");
      if (user.avatar && user.avatar.publicId) {
        try { await cloudinary.uploader.destroy(user.avatar.publicId); }
        catch (error) { console.error("Failed to delete old avatar:", error); }
      }
      user.avatar = { url: result.secure_url, publicId: result.public_id };
      await user.save();
      successResponse(res, { statusCode: 200, message: "Avatar uploaded successfully", payload: { avatar: user.avatar } });
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw createError(500, "Failed to upload avatar");
    }
  }
);

const handleDeleteAvatar = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw createError(404, "User not found");
    if (!user.avatar || !user.avatar.publicId) throw createError(400, "No avatar to delete");
    try {
      await cloudinary.uploader.destroy(user.avatar.publicId);
      user.avatar = undefined;
      await user.save();
      successResponse(res, { statusCode: 200, message: "Avatar deleted successfully" });
    } catch (error) {
      console.error("Avatar deletion error:", error);
      throw createError(500, "Failed to delete avatar");
    }
  }
);

const handleGetUserPreferences = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    return successResponse(res, { statusCode: 200, message: "User preferences retrieved successfully", payload: { preferences: (user as any).preferences || {} } });
  }
);

const handleUpdateUserPreferences = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== "object") return next(createError(400, "Preferences object is required"));
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    (user as any).preferences = { ...((user as any).preferences || {}), ...preferences };
    await user.save();
    return successResponse(res, { statusCode: 200, message: "User preferences updated successfully", payload: { preferences: (user as any).preferences } });
  }
);

const handleGetAccountStatus = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    return successResponse(res, {
      statusCode: 200, message: "Account status retrieved successfully",
      payload: {
        emailVerified: user.emailVerified,
        twoFactorEnabled: !!(user as any).twoFactorAuth?.enabled,
        isBanned: user.isBanned,
        status: (user as any).status || "active",
        lastLogin: (user as any).lastLogin,
        createdAt: (user as any).createdAt,
        passwordChangedAt: (user as any).passwordChangedAt,
      },
    });
  }
);

export {
  handleUpdateProfile, handleUploadAvatar, handleDeleteAvatar,
  handleGetUserPreferences, handleUpdateUserPreferences,
  handleGetAccountStatus,
};

