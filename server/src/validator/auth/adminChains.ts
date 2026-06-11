import { body, param, query } from "express-validator";

export const adminChains = {
  userList: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim().isLength({ max: 50 }).withMessage('Search cannot exceed 50 characters'),
  ],

  userLookup: [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
  ],

  checkAvailability: [
    query('username').optional().isString().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    query('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],

  securityLogs: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],

  updateUserRole: [
    body('role')
      .isString()
      .isIn(['user', 'admin', 'moderator', 'super_admin'])
      .withMessage('Role must be one of: user, admin, moderator, super_admin'),
    param('userId').isMongoId().withMessage('Valid user ID is required'),
  ],

  sendUserEmail: [
    body('subject')
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters'),
    body('message')
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Email message is required'),
    param('userId').isMongoId().withMessage('Valid user ID is required'),
  ],

  adminUpdateUser: [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('username')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('role')
      .optional()
      .isString()
      .isIn(['user', 'admin', 'moderator', 'super_admin'])
      .withMessage('Role must be one of: user, admin, moderator, super_admin'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value'),
    body('isBanned')
      .optional()
      .isBoolean()
      .withMessage('isBanned must be a boolean value'),
    body('status')
      .optional()
      .isString()
      .isIn(['active', 'inactive', 'suspended', 'banned', 'deleted'])
      .withMessage('Status must be one of: active, inactive, suspended, banned, deleted'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array of strings'),
    body('permissions.*')
      .optional()
      .isString()
      .withMessage('Each permission must be a string'),
  ],

  adminCreateUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isString()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('username')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('role')
      .optional()
      .isString()
      .isIn(['user', 'admin', 'moderator', 'super_admin'])
      .default('user')
      .withMessage('Role must be one of: user, admin, moderator, super_admin'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array of strings'),
    body('permissions.*')
      .optional()
      .isString()
      .withMessage('Each permission must be a string'),
  ],

  deleteUser: [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
  ],
};
