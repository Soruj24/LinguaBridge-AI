export { sendWelcomeEmail } from "./welcome";
export { sendOrderConfirmation } from "./orderConfirmation";
export { sendVerificationEmail } from "./verification";
export { sendPasswordResetEmail } from "./passwordReset";
export { sendAdminToUserEmail } from "./adminToUser";
export { sendAccountStatusEmail } from "./accountStatus";
export { sendRoleChangeEmail } from "./roleChange";
export {
  generateUnsubscribeToken,
  getUnsubscribeFooter,
  EMAIL_VERIFICATION_EXPIRY,
  PASSWORD_RESET_EXPIRY,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  isTokenExpired,
  isAccountLocked,
  getEmailVerificationTemplate,
  getPasswordResetTemplate,
} from "./linguabridge";
export type { EmailTemplate } from "./linguabridge";
export { getLoginNotificationTemplate } from "./loginNotification";
export { getSuspiciousActivityTemplate } from "./suspiciousActivity";
export type { LoginNotificationData, SuspiciousActivityData } from "./securityNotificationTypes";
