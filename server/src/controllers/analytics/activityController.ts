import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import UserActivity from "../../models/UserActivity";
import createError from "http-errors";
import { successResponse } from "../responsControllers";

export const getRecentActivity = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const activities = await UserActivity.find()
        .populate("userId", "name email avatar")
        .sort({ timestamp: -1 })
        .limit(limit);

      return successResponse(res, {
        statusCode: 200,
        message: "Recent activities retrieved successfully",
        payload: activities,
      });
    } catch (error) {
      console.error("Get recent activity error:", error);
      return next(createError(500, "Failed to retrieve recent activities"));
    }
  }
);
