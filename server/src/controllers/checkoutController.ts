import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import User from "../models/schemas/User";
import SubscriptionPlan from "../models/SubscriptionPlan";
import UserActivity from "../models/UserActivity";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { getStripe } from "./billingHelpers";

const handleCreateCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { planId } = req.body;
    if (!planId) return next(createError(400, "Plan ID is required"));
    const [plan, user] = await Promise.all([SubscriptionPlan.findById(planId), User.findById(userId)]);
    if (!plan?.isActive) return next(createError(404, "Plan not found"));
    if (!user) return next(createError(404, "User not found"));
    const stripe = getStripe();
    let scid = (user as any).stripeCustomerId;
    if (!scid) { const c = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), metadata: { userId: user._id.toString() } }); scid = c.id; (user as any).stripeCustomerId = scid; await user.save(); }
    const session = await stripe.checkout.sessions.create({
      customer: scid, payment_method_types: ["card"],
      line_items: [{ price_data: { currency: plan.currency.toLowerCase(), unit_amount: Math.round(plan.price * 100), recurring: { interval: plan.interval, interval_count: 1 }, product_data: { name: plan.name, description: plan.description } }, quantity: 1 }],
      mode: "subscription", success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: { userId: userId.toString(), planId },
    });
    await UserActivity.create({ userId, activityType: "checkout_session_created", description: "Created checkout session", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { planId, planName: plan.name }, status: "success" });
    return successResponse(res, { statusCode: 200, message: "Checkout session created", payload: { sessionId: session.id, url: session.url } });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to create checkout session")); }
});

export { handleCreateCheckoutSession };
