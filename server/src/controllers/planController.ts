import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import SubscriptionPlan from "../models/SubscriptionPlan";
import { asyncHandler } from "../middleware/asyncHandler";
import { sanitizeBillingData } from "./billingHelpers";

const handleGetSubscriptionPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    if (!plans?.length) return next(createError(404, "No subscription plans found"));
    return successResponse(res, { statusCode: 200, message: "Plans retrieved", payload: { plans: plans.map((p) => sanitizeBillingData(p.toObject())) } });
  } catch (error) { return next(createError(500, "Failed to retrieve plans")); }
});

export { handleGetSubscriptionPlans };
