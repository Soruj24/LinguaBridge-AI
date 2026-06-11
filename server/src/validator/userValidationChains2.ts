import { body, param, query } from 'express-validator';
import { validationPatterns } from './patterns';

const userValidator2 = {
    // Preferences validation
    preferences: [
        body("preferences.language")
            .optional()
            .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'bn']).withMessage("Invalid language preference"),

        body("preferences.currency")
            .optional()
            .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BDT']).withMessage("Invalid currency preference"),

        body("preferences.timezone")
            .optional()
            .matches(validationPatterns.timezone).withMessage("Invalid timezone format"),

        body("preferences.theme")
            .optional()
            .isIn(['light', 'dark', 'auto']).withMessage("Theme must be light, dark, or auto"),

        body("preferences.notifications.email")
            .optional()
            .isBoolean().withMessage("Email notification preference must be true or false"),

        body("preferences.notifications.sms")
            .optional()
            .isBoolean().withMessage("SMS notification preference must be true or false"),

        body("preferences.notifications.push")
            .optional()
            .isBoolean().withMessage("Push notification preference must be true or false"),

        body("preferences.privacy.profileVisibility")
            .optional()
            .isIn(['public', 'friends', 'private']).withMessage("Profile visibility must be public, friends, or private"),

        body("preferences.privacy.showEmail")
            .optional()
            .isBoolean().withMessage("Show email preference must be true or false"),

        body("preferences.privacy.showPhone")
            .optional()
            .isBoolean().withMessage("Show phone preference must be true or false")
    ],

    // User ID validation
    userId: [
        param("id")
            .trim()
            .notEmpty().withMessage("User ID is required")
            .matches(validationPatterns.objectId).withMessage("Invalid user ID format")
    ],

    // Pagination and query validation
    pagination: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer")
            .toInt(),

        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
            .toInt(),

        query("sort")
            .optional()
            .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage("Sort must be asc or desc")
            .customSanitizer(value => value?.toLowerCase()),

        query("search")
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage("Search term cannot exceed 50 characters")
            .escape()
    ],

    // Date range validation
    dateRange: [
        query("startDate")
            .optional()
            .isISO8601().withMessage("Start date must be a valid ISO 8601 date")
            .custom((value) => {
                const date = new Date(value);
                const minDate = new Date('2000-01-01');
                if (date < minDate) {
                    throw new Error('Start date cannot be before 2000-01-01');
                }
                return true;
            }),

        query("endDate")
            .optional()
            .isISO8601().withMessage("End date must be a valid ISO 8601 date (YYYY-MM-DD)")
            .custom((value, { req }) => {
                const endDate = new Date(value);
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today

                // Safe access with optional chaining
                const startDateValue = req?.query?.startDate as string;
                const startDate = startDateValue ? new Date(startDateValue) : new Date('2000-01-01');

                if (endDate > today) {
                    throw new Error('End date cannot be in the future');
                }

                if (endDate < startDate) {
                    throw new Error('End date cannot be before start date');
                }

                // Check if date range is too large (e.g., more than 1 year)
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 365) {
                    throw new Error('Date range cannot exceed 1 year');
                }

                return true;
            })
    ]
};

export default userValidator2;
