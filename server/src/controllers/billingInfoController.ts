import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import User from "../models/schemas/User";
import Subscription from "../models/Subscription";
import PaymentMethod from "../models/PaymentMethod";
import UserActivity from "../models/UserActivity";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sanitizeBillingData } from "./billingHelpers";

const handleGetBillingInfo = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    const subscription = await Subscription.findOne({ userId, status: { $in: ["active", "trialing"] } }).populate("plan");
    const paymentMethod = await PaymentMethod.findOne({ userId, isDefault: true });
    const storageUsage = { used: 0, total: (subscription as any)?.plan?.storageLimit || 0, percentage: 0 };
    storageUsage.percentage = storageUsage.total ? Math.round((storageUsage.used / storageUsage.total) * 100) : 0;
    const billingInfo = {
      currentPlan: (subscription as any)?.plan || { id: "free", name: "Free Plan", description: "Basic features", price: 0, currency: "USD", interval: "month", features: ["Basic features", "Limited storage", "Community support"], storageLimit: 1024 },
      nextBillingDate: subscription?.currentPeriodEnd || new Date(),
      billingCycle: (subscription as any)?.plan?.interval === "month" ? "Monthly" : "Yearly",
      paymentMethod: paymentMethod ? `${paymentMethod.brand} ****${paymentMethod.last4}` : "No payment method",
      storageUsage, subscriptionStatus: subscription?.status || "inactive",
      daysRemaining: (subscription as any)?.daysRemaining || 0, isActive: (subscription as any)?.isActiveSubscription || false,
    };
    await UserActivity.create({ userId, activityType: "billing_info_viewed", description: "Viewed billing information", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), status: "success" });
    return successResponse(res, { statusCode: 200, message: "Billing info retrieved", payload: sanitizeBillingData(billingInfo) });
  } catch (error) { return next(createError(500, "Failed to retrieve billing info")); }
});

export { handleGetBillingInfo };
