import { body, param } from "express-validator";

export const authValidationChains = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
    body('twoFactorCode').optional().isString().isLength({ min: 6, max: 6 }).withMessage('2FA code must be 6 digits'),
  ],

  registration: [
    body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('validation.username_invalid'),
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('validation.name_invalid'),
    body('email').isEmail().normalizeEmail().withMessage('validation.email_invalid'),
    body('password').isLength({ min: 8 }).withMessage('validation.password_min_length'),
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('validation.first_name_max'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('validation.last_name_max'),
    body('userLanguage').optional().isString().isLength({ min: 2, max: 10 }).withMessage('validation.language_invalid'),
    body('preferredLanguage').optional().isString().isLength({ min: 2, max: 10 }).withMessage('validation.language_invalid'),
  ],

  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('validation.email_invalid'),
  ],

  resetPassword: [
    body('token').isLength({ min: 1 }).withMessage('validation.token_required'),
    body('newPassword').isLength({ min: 12 }).withMessage('validation.password_min_length'),
  ],

  passwordChange: [
    body('oldPassword').isLength({ min: 1 }).withMessage('validation.password_required'),
    body('newPassword').isLength({ min: 12 }).withMessage('validation.password_min_length'),
    param('userId').isMongoId().withMessage('validation.user_id_invalid'),
  ],

  emailVerification: [
    body('token').isLength({ min: 1 }).withMessage('Verification token is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],

  resendVerification: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
};
