import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import createError from "http-errors";
import { successResponse } from "./responsControllers";
import { AuthRequest } from "../types";
import User from "../models/schemas/User";
import Subscription from "../models/Subscription";
import SubscriptionPlan from "../models/SubscriptionPlan";
import Invoice from "../models/Invoice";
import UserActivity from "../models/UserActivity";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sanitizeBillingData, getOrCreatePriceId } from "./billingHelpers";
import { STRIPE_SECRET_KEY } from "../secret";

const stripe = new Stripe(STRIPE_SECRET_KEY!);

const handleGetCurrentSubscription = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user!._id, status: { $in: ["active", "trialing", "past_due"] } }).populate("plan");
    if (!subscription) return successResponse(res, { statusCode: 200, message: "No active subscription", payload: { plan: null } });
    const s = subscription.toObject();
    return successResponse(res, { statusCode: 200, message: "Current subscription retrieved", payload: { plan: sanitizeBillingData((s as any).plan), subscription: { ...sanitizeBillingData(s), daysRemaining: (subscription as any).daysRemaining, isActive: (subscription as any).isActiveSubscription, isTrialing: (subscription as any).isTrialing, isPastDue: (subscription as any).isPastDue, isCanceled: (subscription as any).isCanceled } } });
  } catch (error) { return next(createError(500, "Failed to retrieve current subscription")); }
});

const handleCreateSubscription = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { planId, paymentMethodId, couponCode } = req.body;
    if (!planId) return next(createError(400, "Plan ID is required"));
    const [user, plan] = await Promise.all([User.findById(userId), SubscriptionPlan.findById(planId)]);
    if (!user) return next(createError(404, "User not found"));
    if (!plan?.isActive) return next(createError(404, "Plan not found"));
    if (await Subscription.findOne({ userId, status: { $in: ["active", "trialing"] } })) return next(createError(400, "You already have an active subscription"));
    let scid = (user as any).stripeCustomerId;
    if (!scid) { const c = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), metadata: { userId: user._id.toString() } }); scid = c.id; (user as any).stripeCustomerId = scid; await user.save(); }
    const priceId = await getOrCreatePriceId(plan);
    const subData: Stripe.SubscriptionCreateParams = { customer: scid, items: [{ price: priceId }], payment_behavior: "default_incomplete", expand: ["latest_invoice.payment_intent"] };
    if (couponCode) subData.discounts = [{ coupon: couponCode }];
    if (paymentMethodId) subData.default_payment_method = paymentMethodId;
    const ss = await stripe.subscriptions.create(subData);
    const subscription = await Subscription.create({ userId, planId: plan._id, stripeSubscriptionId: ss.id, stripeCustomerId: scid, status: ss.status, currentPeriodStart: new Date((ss as any).current_period_start * 1000), currentPeriodEnd: new Date((ss as any).current_period_end * 1000), cancelAtPeriodEnd: ss.cancel_at_period_end, trialStart: ss.trial_start ? new Date(ss.trial_start * 1000) : undefined, trialEnd: ss.trial_end ? new Date(ss.trial_end * 1000) : undefined, quantity: 1, metadata: { stripe: ss, createdAt: new Date() } });
    await UserActivity.create({ userId, activityType: "subscription_created", description: `Created ${plan.name}`, ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { planId: plan._id, planName: plan.name }, status: "success" });
    const ps = await Subscription.findById(subscription._id).populate("plan");
    return successResponse(res, { statusCode: 201, message: "Subscription created", payload: { subscription: sanitizeBillingData(ps?.toObject()), clientSecret: (ss.latest_invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent })?.payment_intent?.client_secret, requiresPayment: ss.status === "incomplete" } });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to create subscription")); }
});

const handleUpdateSubscription = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { planId } = req.body;
    if (!planId) return next(createError(400, "Plan ID is required"));
    const subscription = await Subscription.findOne({ userId, status: "active" });
    if (!subscription || !(subscription as any).stripeSubscriptionId) return next(createError(404, "No active subscription"));
    const newPlan = await SubscriptionPlan.findById(planId);
    if (!newPlan?.isActive) return next(createError(404, "Plan not found"));
    if (subscription.planId?.toString() === planId) return next(createError(400, "Already on this plan"));
    const ss = await stripe.subscriptions.retrieve((subscription as any).stripeSubscriptionId as string);
    const np = await getOrCreatePriceId(newPlan);
    const us = await stripe.subscriptions.update((subscription as any).stripeSubscriptionId as string, { items: [{ id: ss.items.data[0].id, price: np }], proration_behavior: "create_prorations" });
    subscription.planId = newPlan._id; subscription.status = us.status;
    subscription.currentPeriodStart = new Date((us as any).current_period_start * 1000); subscription.currentPeriodEnd = new Date((us as any).current_period_end * 1000);
    await subscription.save();
    if (us.latest_invoice) { const li = us.latest_invoice as Stripe.Invoice; await Invoice.create({ userId, subscriptionId: subscription._id, stripeInvoiceId: li.id, amount: li.amount_due ? li.amount_due / 100 : 0, currency: li.currency, status: li.status, invoiceNumber: li.number, date: new Date(li.created * 1000), periodStart: new Date((li.period_start as number) * 1000), periodEnd: new Date((li.period_end as number) * 1000) }); }
    await UserActivity.create({ userId, activityType: "subscription_updated", description: `Updated to ${newPlan.name}`, ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { newPlanName: newPlan.name }, status: "success" });
    const us2 = await Subscription.findById(subscription._id).populate("plan");
    return successResponse(res, { statusCode: 200, message: "Subscription updated", payload: { subscription: sanitizeBillingData(us2?.toObject()), plan: sanitizeBillingData(newPlan.toObject()) } });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to update subscription")); }
});

const handleCancelSubscription = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { cancelAtPeriodEnd = true, reason } = req.body;
    const subscription = await Subscription.findOne({ userId, status: "active" });
    if (!subscription || !(subscription as any).stripeSubscriptionId) return next(createError(404, "No active subscription"));
    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update((subscription as any).stripeSubscriptionId as string, { cancel_at_period_end: true });
      subscription.cancelAtPeriodEnd = true;
      await subscription.save();
      await UserActivity.create({ userId, activityType: "subscription_canceled_at_period_end", description: "Scheduled cancellation", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { reason }, status: "success" });
      return successResponse(res, { statusCode: 200, message: "Cancels at period end", payload: { subscription: sanitizeBillingData(subscription.toObject()), cancelAtPeriodEnd: true } });
    } else {
      await subscription.cancel(reason, userId.toString());
      await stripe.subscriptions.cancel((subscription as any).stripeSubscriptionId as string);
      await UserActivity.create({ userId, activityType: "subscription_canceled_immediately", description: "Immediate cancellation", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { reason }, status: "success" });
      return successResponse(res, { statusCode: 200, message: "Canceled immediately", payload: { subscription: sanitizeBillingData(subscription.toObject()), cancelAtPeriodEnd: false } });
    }
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to cancel subscription")); }
});

export { handleGetCurrentSubscription, handleCreateSubscription, handleUpdateSubscription, handleCancelSubscription };
