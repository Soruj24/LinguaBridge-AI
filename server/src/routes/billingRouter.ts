import { Router } from "express";
import { handleGetBillingInfo } from "../controllers/billingInfoController";
import { handleGetSubscriptionPlans } from "../controllers/planController";
import { handleGetCurrentSubscription, handleCreateSubscription, handleUpdateSubscription, handleCancelSubscription } from "../controllers/subscriptionController";
import { handleGetPaymentMethods, handleAddPaymentMethod, handleSetDefaultPaymentMethod, handleRemovePaymentMethod } from "../controllers/paymentMethodController";
import { handleGetInvoices, handleDownloadInvoice } from "../controllers/invoiceController";
import { handleCreateCheckoutSession } from "../controllers/checkoutController";
import { handleGetUsageStats } from "../controllers/usageController";
import { handleStripeWebhook } from "../controllers/stripeWebhookController";
import { handleAdminListSubscriptions, handleAdminListInvoices, handleAdminUpdateSubscription } from "../controllers/adminBillingController";
import { isLoggedIn, hasPermission } from "../middleware";
import { Permission } from "../models/User";
import { runValidation } from "../validator";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { rateLimitConfig, validationRules } from "../validator/billing";

const billingRouter = Router();
const createRateLimiter = (config: any) => rateLimit({ windowMs: config.windowMs, max: config.max, message: config.message || 'Too many requests', standardHeaders: config.standardHeaders !== undefined ? config.standardHeaders : true, legacyHeaders: config.legacyHeaders !== undefined ? config.legacyHeaders : false });
const generalLimiter = createRateLimiter(rateLimitConfig.general);
const sensitiveActionLimiter = createRateLimiter(rateLimitConfig.sensitiveAction);

billingRouter.post("/stripe-webhook", bodyParser.raw({ type: "application/json" }), handleStripeWebhook);
billingRouter.get("/subscription-plans", generalLimiter, handleGetSubscriptionPlans);
billingRouter.get("/info", isLoggedIn, generalLimiter, handleGetBillingInfo);

billingRouter.get("/subscription", isLoggedIn, generalLimiter, handleGetCurrentSubscription);
billingRouter.post("/subscription", isLoggedIn, sensitiveActionLimiter, validationRules.createSubscription, runValidation, handleCreateSubscription);
billingRouter.put("/subscription", isLoggedIn, sensitiveActionLimiter, validationRules.updateSubscription, runValidation, handleUpdateSubscription);
billingRouter.delete("/subscription", isLoggedIn, sensitiveActionLimiter, handleCancelSubscription);

billingRouter.get("/payment-methods", isLoggedIn, generalLimiter, handleGetPaymentMethods);
billingRouter.post("/payment-methods", isLoggedIn, generalLimiter, validationRules.addPaymentMethod, runValidation, handleAddPaymentMethod);
billingRouter.put("/payment-methods/:paymentMethodId/default", isLoggedIn, generalLimiter, validationRules.setDefaultPaymentMethod, runValidation, handleSetDefaultPaymentMethod);
billingRouter.delete("/payment-methods/:paymentMethodId", isLoggedIn, generalLimiter, validationRules.removePaymentMethod, runValidation, handleRemovePaymentMethod);

billingRouter.get("/invoices", isLoggedIn, generalLimiter, validationRules.getInvoices, runValidation, handleGetInvoices);
billingRouter.get("/invoices/:invoiceId/download", isLoggedIn, generalLimiter, validationRules.downloadInvoice, runValidation, handleDownloadInvoice);
billingRouter.post("/create-checkout-session", isLoggedIn, sensitiveActionLimiter, validationRules.createCheckoutSession, runValidation, handleCreateCheckoutSession);
billingRouter.get("/usage", isLoggedIn, generalLimiter, handleGetUsageStats);

billingRouter.get("/admin/subscriptions", isLoggedIn, hasPermission(Permission.BILLING_VIEW), generalLimiter, validationRules.adminList, runValidation, handleAdminListSubscriptions);
billingRouter.get("/admin/invoices", isLoggedIn, hasPermission(Permission.BILLING_VIEW), generalLimiter, validationRules.adminList, runValidation, handleAdminListInvoices);
billingRouter.put("/admin/subscriptions/:subscriptionId", isLoggedIn, hasPermission(Permission.BILLING_EDIT), sensitiveActionLimiter, validationRules.adminUpdateSubscription, runValidation, handleAdminUpdateSubscription);

billingRouter.get("/health", generalLimiter, (req, res) => { res.status(200).json({ status: "OK", timestamp: new Date().toISOString(), uptime: process.uptime(), service: "Billing Service", stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not configured" }); });

export default billingRouter;


