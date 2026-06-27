import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import createError from "http-errors";
import User from "../models/schemas/User";
import Subscription from "../models/Subscription";
import Invoice from "../models/Invoice";
import PaymentMethod from "../models/PaymentMethod";
import { getStripe } from "./billingHelpers";

const handleSubscriptionEvent = async (sub: Stripe.Subscription) => {
  const customerId = sub.customer as string;
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) { console.error("User not found for customer:", customerId); return; }
  const existing = await Subscription.findOne({ stripeSubscriptionId: sub.id });
  const data = { status: sub.status, currentPeriodStart: new Date((sub as any).current_period_start * 1000), currentPeriodEnd: new Date((sub as any).current_period_end * 1000), cancelAtPeriodEnd: sub.cancel_at_period_end, trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined, trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined };
  if (existing) { Object.assign(existing, data); await existing.save(); }
  else { await Subscription.create({ userId: user._id, stripeSubscriptionId: sub.id, stripeCustomerId: customerId, ...data, metadata: { stripe: sub, createdAt: new Date() } }); }
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  const customerId = invoice.customer as string;
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) { console.error("User not found for customer:", customerId); return; }
  await Invoice.create({ userId: user._id, stripeInvoiceId: invoice.id, amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0, currency: invoice.currency, status: invoice.status, invoiceNumber: invoice.number || undefined, date: new Date(invoice.created * 1000), periodStart: new Date((invoice.period_start as number) * 1000), periodEnd: new Date((invoice.period_end as number) * 1000), pdfUrl: invoice.invoice_pdf || undefined });
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const customerId = invoice.customer as string;
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) { console.error("User not found for customer:", customerId); return; }
  await Subscription.findOneAndUpdate({ stripeCustomerId: customerId }, { status: "past_due" });
  await Invoice.create({ userId: user._id, stripeInvoiceId: invoice.id, amount: invoice.amount_due ? invoice.amount_due / 100 : 0, currency: invoice.currency, status: "failed", invoiceNumber: invoice.number || undefined, date: new Date(invoice.created * 1000), periodStart: new Date((invoice.period_start as number) * 1000), periodEnd: new Date((invoice.period_end as number) * 1000) });
};

const handlePaymentMethodAttached = async (pm: Stripe.PaymentMethod) => { console.log(`Payment method ${pm.id} attached`); };

const handlePaymentMethodDetached = async (pm: Stripe.PaymentMethod) => { await PaymentMethod.findOneAndDelete({ stripePaymentMethodId: pm.id }); };

const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;
    try { event = getStripe().webhooks.constructEvent(req.body, sig, endpointSecret); }
    catch (err: any) { return next(createError(400, `Webhook Error: ${err.message}`)); }
    switch (event.type) {
      case "customer.subscription.created": case "customer.subscription.updated": case "customer.subscription.deleted": await handleSubscriptionEvent(event.data.object as Stripe.Subscription); break;
      case "invoice.paid": await handleInvoicePaid(event.data.object as Stripe.Invoice); break;
      case "invoice.payment_failed": await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice); break;
      case "payment_method.attached": await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod); break;
      case "payment_method.detached": await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod); break;
      default: console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send({ received: true });
  } catch (error) { return next(createError(500, "Webhook handler failed")); }
};

export { handleStripeWebhook };
