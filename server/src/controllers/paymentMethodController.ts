import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import User from "../models/schemas/User";
import PaymentMethod from "../models/PaymentMethod";
import UserActivity from "../models/UserActivity";
import { getClientIP } from "../utils";
import { asyncHandler } from "../middleware/asyncHandler";
import { sanitizeBillingData, getStripe } from "./billingHelpers";

const handleGetPaymentMethods = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const methods = await PaymentMethod.find({ userId: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    return successResponse(res, { statusCode: 200, message: "Payment methods retrieved", payload: { paymentMethods: methods.map((m) => sanitizeBillingData(m.toObject())) } });
  } catch (error) { return next(createError(500, "Failed to retrieve payment methods")); }
});

const handleAddPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { paymentMethodId, type = "card", isDefault = false } = req.body;
    if (!paymentMethodId) return next(createError(400, "Payment method ID is required"));
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    const stripe = getStripe();
    let scid = (user as any).stripeCustomerId;
    if (!scid) { const c = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), metadata: { userId: user._id.toString() } }); scid = c.id; (user as any).stripeCustomerId = scid; await (user as any).save(); }
    const apm = await stripe.paymentMethods.attach(paymentMethodId, { customer: scid });
    if (isDefault) { await stripe.customers.update(scid, { invoice_settings: { default_payment_method: paymentMethodId } }); await PaymentMethod.updateMany({ userId, isDefault: true }, { isDefault: false }); }
    const pm = await PaymentMethod.create({ userId, stripePaymentMethodId: apm.id, type: apm.type, brand: (apm as any).card?.brand, last4: (apm as any).card?.last4, expiryMonth: (apm as any).card?.exp_month, expiryYear: (apm as any).card?.exp_year, isDefault, metadata: { stripe: apm, attachedAt: new Date() } });
    await UserActivity.create({ userId, activityType: "payment_method_added", description: `Added ${(apm as any).card?.brand || type}`, ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { brand: (apm as any).card?.brand, last4: (apm as any).card?.last4, isDefault }, status: "success" });
    return successResponse(res, { statusCode: 201, message: "Payment method added", payload: { paymentMethod: sanitizeBillingData(pm.toObject()) } });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to add payment method")); }
});

const handleSetDefaultPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { paymentMethodId } = req.params;
    if (!paymentMethodId) return next(createError(400, "Payment method ID is required"));
    const pm = await PaymentMethod.findOne({ _id: paymentMethodId, userId });
    if (!pm) return next(createError(404, "Payment method not found"));
    const user = await User.findById(userId);
    if (!(user as any)?.stripeCustomerId) return next(createError(404, "Stripe customer not found"));
    const stripe = getStripe();
    await stripe.customers.update((user as any).stripeCustomerId as string, { invoice_settings: { default_payment_method: pm.stripePaymentMethodId } });
    await PaymentMethod.updateMany({ userId, isDefault: true }, { isDefault: false });
    pm.isDefault = true; pm.updatedAt = new Date(); await pm.save();
    await UserActivity.create({ userId, activityType: "payment_method_default_changed", description: "Set default payment method", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { brand: pm.brand, last4: pm.last4 }, status: "success" });
    return successResponse(res, { statusCode: 200, message: "Default payment method updated", payload: { paymentMethod: sanitizeBillingData(pm.toObject()) } });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to update default")); }
});

const handleRemovePaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { paymentMethodId } = req.params;
    if (!paymentMethodId) return next(createError(400, "Payment method ID is required"));
    const pm = await PaymentMethod.findOne({ _id: paymentMethodId, userId });
    if (!pm) return next(createError(404, "Payment method not found"));
    if (pm.isDefault) return next(createError(400, "Cannot remove default payment method. Set another as default first."));
    const user = await User.findById(userId);
    if (!(user as any)?.stripeCustomerId) return next(createError(404, "Stripe customer not found"));
    const stripe = getStripe();
    try { await stripe.paymentMethods.detach(pm.stripePaymentMethodId); } catch (e: any) { if (e.code !== "resource_missing") throw e; }
    await PaymentMethod.findByIdAndDelete(paymentMethodId);
    await UserActivity.create({ userId, activityType: "payment_method_removed", description: "Removed payment method", ipAddress: getClientIP(req), userAgent: req.get("User-Agent"), metadata: { brand: pm.brand, last4: pm.last4 }, status: "success" });
    return successResponse(res, { statusCode: 200, message: "Payment method removed" });
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to remove payment method")); }
});

export { handleGetPaymentMethods, handleAddPaymentMethod, handleSetDefaultPaymentMethod, handleRemovePaymentMethod };
