import Stripe from "stripe";
import SubscriptionPlan from "../models/SubscriptionPlan";
import { env } from "../shared/env";

const _stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const getStripe = (): Stripe => {
  if (!_stripe) throw new Error("Stripe is not configured. Provide a valid env.STRIPE_SECRET_KEY.");
  return _stripe;
};

export const sanitizeBillingData = (data: any) => {
  if (!data) return data;
  const sanitized = { ...data };
  delete sanitized.stripeCustomerId;
  delete sanitized.stripeSubscriptionId;
  delete sanitized.stripePaymentMethodId;
  delete sanitized.metadata?.stripe;
  return sanitized;
};

export const getOrCreatePriceId = async (plan: any): Promise<string> => {
  const stripe = getStripe();
  if (plan.stripePriceId) return plan.stripePriceId;
  const prices = await stripe.prices.list({ product: plan.stripeProductId, recurring: { interval: plan.interval }, active: true });
  if (prices.data.length > 0) return prices.data[0].id;
  const price = await stripe.prices.create({ unit_amount: Math.round(plan.price * 100), currency: plan.currency.toLowerCase(), recurring: { interval: plan.interval, interval_count: 1 }, product: plan.stripeProductId });
  return price.id;
};
