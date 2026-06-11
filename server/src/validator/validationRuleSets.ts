import { body, query } from 'express-validator';
import userValidator from './userValidationChains';
import userValidator2 from './userValidationChains2';
import userValidator3 from './userValidationChains3';
import { getPasswordStrength } from './passwordStrength';

export const validationRules = {
    // User registration
    registration: [
        ...userValidator.username,
        ...userValidator.email,
        ...userValidator.password,
        ...userValidator3.acceptTerms,
        ...userValidator.profile
    ],

    // Profile update
    profileUpdate: [
        ...userValidator.profile,
        ...userValidator.address,
        ...userValidator2.preferences
    ],

    // Password change
    passwordChange: [
        body("currentPassword")
            .notEmpty().withMessage("Current password is required"),

        body("newPassword")
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 12, max: 128 }).withMessage("New password must be between 12 and 128 characters")
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error("New password must be different from current password");
                }
                return true;
            }),

        body("confirmPassword")
            .notEmpty().withMessage("Password confirmation is required")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Password confirmation does not match");
                }
                return true;
            })
    ],

    // Admin user management
    adminUpdateUser: [
        ...userValidator2.userId,
        ...userValidator.profile,
        ...userValidator3.status,
        ...userValidator3.role,
        ...userValidator2.preferences
    ],

    // Bulk operations
    bulkOperations: [
        ...userValidator3.bulkOperations
    ],

    // User search and listing
    userSearch: [
        ...userValidator2.pagination,
        query("role")
            .optional()
            .isIn(['user', 'admin', 'moderator', 'editor', 'viewer']).withMessage("Invalid role filter"),

        query("status")
            .optional()
            .isIn(['active', 'inactive', 'suspended', 'banned', 'pending']).withMessage("Invalid status filter"),

        query("dateRange")
            .optional()
            .isIn(['today', 'week', 'month', 'year', 'custom']).withMessage("Invalid date range filter")
    ],

    // Password reset (admin)
    adminResetPassword: [
        ...userValidator2.userId,
        body("newPassword")
            .optional()
            .isLength({ min: 12, max: 128 }).withMessage("New password must be between 12 and 128 characters")
            .custom((value) => {
                const strength = getPasswordStrength(value);
                if (strength.score < 6) {
                    throw new Error(`Password too weak: ${strength.feedback.join(', ')}`);
                }
                return true;
            }),

        body("notifyUser")
            .optional()
            .isBoolean().withMessage("Notify user must be true or false")
    ],

    // User status update
    userStatus: [
        ...userValidator2.userId,
        ...userValidator3.status,
        body("reason")
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters")
            .escape()
    ],

    // Email verification
    emailVerification: [
        ...userValidator2.userId,
        body("verified")
            .isBoolean().withMessage("Verified must be true or false")
    ],

    // Two-factor authentication
    twoFactor: [
        ...userValidator2.userId,
        body("enabled")
            .isBoolean().withMessage("Enabled must be true or false")
    ],

    // Avatar upload
    avatarUpload: [
        ...userValidator3.avatar
    ],

    // Export users
    exportUsers: [
        query("format")
            .optional()
            .isIn(['json', 'csv', 'xml']).withMessage("Export format must be json, csv, or xml"),

        query("fields")
            .optional()
            .isArray().withMessage("Fields must be an array")
            .custom((value: string[]) => {
                const allowedFields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'];
                const invalidFields = value.filter(field => !allowedFields.includes(field));
                if (invalidFields.length > 0) {
                    throw new Error(`Invalid export fields: ${invalidFields.join(', ')}`);
                }
                return true;
            })
    ]
};
