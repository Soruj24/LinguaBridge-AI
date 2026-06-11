import { rateLimitConfig } from "./authRateLimits";
import { authValidationChains } from "./authValidationChains";
import { twoFactorChains } from "./twoFactorChains";
import { profileChains } from "./profileChains";
import { adminChains } from "./adminChains";

export { rateLimitConfig };
export const validationRules = {
  ...authValidationChains,
  ...twoFactorChains,
  ...profileChains,
  ...adminChains,
};
