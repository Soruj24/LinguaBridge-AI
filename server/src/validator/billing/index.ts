import { rateLimitConfig } from "./billingRateLimits";
import { subscriptionChains } from "./subscriptionChains";
import { paymentMethodChains } from "./paymentMethodChains";
import { invoiceChains } from "./invoiceChains";
import { checkoutChains } from "./checkoutChains";
import { adminBillingChains } from "./adminBillingChains";
import { adminUserChains } from "./adminUserChains";

export { rateLimitConfig };
export const validationRules = {
  ...subscriptionChains,
  ...paymentMethodChains,
  ...invoiceChains,
  ...checkoutChains,
  ...adminBillingChains,
  ...adminUserChains,
};
