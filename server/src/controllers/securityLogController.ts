import { Response, NextFunction } from "express";
import createError from "http-errors";

import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import UserActivity from "../models/UserActivity";
import { asyncHandler } from "../middleware/asyncHandler";

const handleGetSecurityLogs = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const [activities, totalActivities] = await Promise.all([UserActivity.find({ userId }).sort({ timestamp: -1 }).limit(limit).skip((page - 1) * limit), UserActivity.countDocuments({ userId })]);
    return successResponse(res, {
      statusCode: 200, message: "Security logs retrieved successfully",
      payload: { activities, pagination: { totalActivities, totalPages: Math.ceil(totalActivities / limit), currentPage: page, previousPage: page - 1 > 0 ? page - 1 : null, nextPage: page + 1 <= Math.ceil(totalActivities / limit) ? page + 1 : null } },
    });
  }
);

const handleClearSecurityLogs = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const result = await UserActivity.deleteMany({ userId });
    return successResponse(res, { statusCode: 200, message: "Security logs cleared successfully", payload: { deletedCount: result.deletedCount } });
  }
);

export { handleGetSecurityLogs, handleClearSecurityLogs };
