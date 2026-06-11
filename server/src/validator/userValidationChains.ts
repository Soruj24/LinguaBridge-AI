import { body } from 'express-validator';
import { validationPatterns } from './patterns';
import { sanitizers } from './sanitizers';
import { getPasswordStrength } from './passwordStrength';

const userValidator = {
    // Enhanced username validation
    username: [
        body("username")
            .trim()
            .escape()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters")
            .matches(validationPatterns.username).withMessage("Username can only contain letters, numbers, underscores, and hyphens")
            .custom((value) => {
                const reservedNames = [
                    'administrator', 'root', 'system', 'api', 'www',
                    'mail', 'ftp', 'support', 'help', 'info', 'contact',
                    'test', 'guest', 'anonymous', 'null', 'undefined', 'moderator',
                    'owner', 'staff', 'supportteam', 'helpdesk'
                ];
                if (reservedNames.includes(value.toLowerCase())) {
                    throw new Error('This username is reserved');
                }

                // Check for offensive words
                const offensiveWords = ['fuck', 'shit', 'asshole', 'bastard', 'bitch', 'nigger', 'retard'];
                if (offensiveWords.some(word => value.toLowerCase().includes(word))) {
                    throw new Error('Username contains inappropriate language');
                }

                return true;
            })
            .customSanitizer(sanitizers.toLowerCase)
    ],

    // Enhanced email validation
    email: [
        body("email")
            .trim()
            .toLowerCase()
            .notEmpty().withMessage("Email is required")
            .isLength({ max: 254 }).withMessage("Email address is too long")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail({
                gmail_remove_dots: false,
                gmail_remove_subaddress: false,
                outlookdotcom_remove_subaddress: false,
                yahoo_remove_subaddress: false,
                icloud_remove_subaddress: false
            })
            .custom((value) => {
                const disposableDomains = [
                    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
                    'mailinator.com', 'throwaway.email', 'temp-mail.org',
                    'getairmail.com', 'yopmail.com', 'trashmail.com'
                ];
                const domain = value.split('@')[1];
                if (disposableDomains.includes(domain.toLowerCase())) {
                    throw new Error('Disposable email addresses are not allowed');
                }
                return true;
            })
    ],

    // Enhanced password validation
    password: [
        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 12, max: 128 }).withMessage("Password must be between 12 and 128 characters")
            .custom((value, { req }) => {
                const strength = getPasswordStrength(value);
                if (strength.score < 6) {
                    throw new Error(`Password too weak: ${strength.feedback.join(', ')}`);
                }

                // Check against personal information
                const personalInfo = [
                    req.body.username,
                    req.body.email?.split('@')[0],
                    req.body.firstName,
                    req.body.lastName
                ].filter(Boolean);

                for (const info of personalInfo) {
                    if (info && info.length > 2 && value.toLowerCase().includes(info.toLowerCase())) {
                        throw new Error('Password should not contain your personal information');
                    }
                }

                return true;
            })
    ],

    // Profile validation
    profile: [
        body("firstName")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 }).withMessage("First name must be between 1 and 50 characters")
            .matches(validationPatterns.name).withMessage("First name can only contain letters, spaces, hyphens, and apostrophes")
            .customSanitizer(sanitizers.removeExtraSpaces),

        body("lastName")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 }).withMessage("Last name must be between 1 and 50 characters")
            .matches(validationPatterns.name).withMessage("Last name can only contain letters, spaces, hyphens, and apostrophes")
            .customSanitizer(sanitizers.removeExtraSpaces),

        body("phone")
            .optional()
            .trim()
            .matches(validationPatterns.phone).withMessage("Please provide a valid phone number"),

        body("bio")
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters")
            .escape(),

        body("website")
            .optional()
            .trim()
            .isURL().withMessage("Please provide a valid website URL")
            .isLength({ max: 200 }).withMessage("Website URL is too long")
    ],

    // Address validation
    address: [
        body("addresses.*.type")
            .optional()
            .isIn(['home', 'work', 'billing', 'shipping', 'other']).withMessage("Invalid address type"),

        body("addresses.*.street")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage("Street address must be between 1 and 100 characters")
            .customSanitizer(sanitizers.escape),

        body("addresses.*.city")
            .optional()
            .trim()
            .matches(/^[a-zA-Z\s'-]+$/).withMessage("City name can only contain letters, spaces, hyphens, and apostrophes")
            .isLength({ min: 1, max: 50 }).withMessage("City name must be between 1 and 50 characters"),

        body("addresses.*.state")
            .optional()
            .trim()
            .matches(/^[a-zA-Z\s'-]+$/).withMessage("State name can only contain letters, spaces, hyphens, and apostrophes")
            .isLength({ min: 1, max: 50 }).withMessage("State name must be between 1 and 50 characters"),

        body("addresses.*.zipCode")
            .optional()
            .trim()
            .matches(validationPatterns.zipCode).withMessage("Please provide a valid postal/ZIP code"),

        body("addresses.*.country")
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage("Country name must be between 2 and 50 characters")
            .isAlpha('en-US', { ignore: ' ' }).withMessage("Country name can only contain letters and spaces")
    ]
};

export default userValidator;
