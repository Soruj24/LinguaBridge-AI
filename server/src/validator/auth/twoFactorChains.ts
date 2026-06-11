import { body } from "express-validator";

export const twoFactorChains = {
  twoFactorSetup: [
    // No body validation needed for setup initiation
  ],

  twoFactorVerify: [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  ],

  twoFactorDisable: [
    body('password').isLength({ min: 1 }).withMessage('Password is required to disable 2FA'),
  ],
};
