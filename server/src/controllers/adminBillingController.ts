import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import Subscription from "../models/Subscription";
import Invoice from "../models/Invoice";
import UserActivity from "../models/UserActivity";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";

const handleAdminListSubscriptions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1, limit = Number(req.query.limit) || 20;
    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    const [subscriptions, total] = await Promise.all([Subscription.find(query).populate("userId", "firstName lastName email").populate("plan").sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit), Subscription.countDocuments(query)]);
    return successResponse(res, { statusCode: 200, message: "Subscriptions retrieved", payload: { subscriptions, pagination: { totalSubscriptions: total, totalPages: Math.ceil(total / limit), currentPage: page } } });
  } catch (error) { return next(createError(500, "Failed to retrieve subscriptions")); }
});

const handleAdminListInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1, limit = Number(req.query.limit) || 20;
    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    const [invoices, total] = await Promise.all([Invoice.find(query).populate("userId", "firstName lastName email").sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit), Invoice.countDocuments(query)]);
    return successResponse(res, { statusCode: 200, message: "Invoices retrieved", payload: { invoices, pagination: { totalInvoices: total, totalPages: Math.ceil(total / limit), currentPage: page } } });
  } catch (error) { return next(createError(500, "Failed to retrieve invoices")); }
});

const handleAdminUpdateSubscription = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;
    const updates = req.body;
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return next(createError(404, "Subscription not found"));
    ["status", "trialEnd", "cancelAtPeriodEnd"].forEach((f) => { if (updates[f] !== undefined) (subscription as any)[f] = updates[f]; });
    await subscription.save();
    await UserActivity.create({ userId: req.user!._id, activityType: "admin_subscription_updated", description: `Updated sub ${subscriptionId}`, ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { targetSubscriptionId: subscriptionId, updates }, status: "success" });
    return successResponse(res, { statusCode: 200, message: "Subscription updated", payload: { subscription } });
  } catch (error) { return next(createError(500, "Failed to update subscription")); }
});

export { handleAdminListSubscriptions, handleAdminListInvoices, handleAdminUpdateSubscription };
