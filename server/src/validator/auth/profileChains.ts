import { body } from "express-validator";

export const profileChains = {
  profileUpdate: [
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
    body('userLanguage').optional().isString().isLength({ min: 2, max: 10 }).withMessage('Language must be a valid code'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
  ],

  deleteAccount: [
    body('password').isLength({ min: 1 }).withMessage('Password is required to delete account'),
  ],

  deactivateAccount: [
    body('password').isLength({ min: 1 }).withMessage('Password is required to deactivate account'),
  ],

  reactivateAccount: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],

  updateEmail: [
    body('newEmail').isEmail().normalizeEmail().withMessage('Valid new email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required for verification'),
  ],

  preferencesUpdate: [
    body('preferences').isObject().withMessage('Preferences must be an object'),
    body('preferences.theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
    body('preferences.language').optional().isString().isLength({ min: 2, max: 10 }).withMessage('Language must be a valid code'),
    body('preferences.timezone').optional().isString().withMessage('Timezone must be a valid timezone'),
    body('preferences.notifications').optional().isObject().withMessage('Notifications must be an object'),
    body('preferences.notifications.email').optional().isBoolean().withMessage('Email notifications must be boolean'),
    body('preferences.notifications.push').optional().isBoolean().withMessage('Push notifications must be boolean'),
    body('preferences.notifications.twoFactor').optional().isBoolean().withMessage('Two-factor notifications must be boolean'),
  ],
};
