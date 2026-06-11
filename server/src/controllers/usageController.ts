import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responsControllers";
import { AuthRequest } from "../types";
import Subscription from "../models/Subscription";
import { asyncHandler } from "../middleware/asyncHandler";

const handleGetUsageStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user!._id, status: { $in: ["active", "trialing"] } }).populate("plan");
    if (!subscription) return successResponse(res, { statusCode: 200, message: "No active subscription", payload: { hasSubscription: false } });
    const plan = (subscription as any).plan as any;
    const usageStats = {
      subscription: { planName: plan?.name, startDate: subscription.currentPeriodStart, endDate: (subscription as any).currentPeriodEnd, daysRemaining: (subscription as any).daysRemaining, isTrialing: (subscription as any).isTrialing },
      storage: { used: 0, limit: plan?.storageLimit || 0, percentage: 0 },
      apiCalls: { used: 0, limit: plan?.apiCallLimit || 0, percentage: 0 },
    };
    if (usageStats.storage.limit > 0) usageStats.storage.percentage = Math.round((usageStats.storage.used / usageStats.storage.limit) * 100);
    if (usageStats.apiCalls.limit > 0) usageStats.apiCalls.percentage = Math.round((usageStats.apiCalls.used / usageStats.apiCalls.limit) * 100);
    return successResponse(res, { statusCode: 200, message: "Usage stats retrieved", payload: usageStats });
  } catch (error) { return next(createError(500, "Failed to retrieve usage stats")); }
});

export { handleGetUsageStats };
