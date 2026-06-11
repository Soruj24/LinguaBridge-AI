import { body } from 'express-validator';
import { validationPatterns } from './patterns';

const userValidator3 = {
    // Status validation
    status: [
        body("status")
            .optional()
            .isIn(['active', 'inactive', 'suspended', 'banned', 'pending']).withMessage("Invalid status")
    ],

    // Role validation
    role: [
        body("role")
            .optional()
            .isIn(['user', 'admin', 'moderator', 'editor', 'viewer']).withMessage("Invalid role")
    ],

    // Terms acceptance
    acceptTerms: [
        body("acceptTerms")
            .custom((value) => {
                if (value !== true) {
                    throw new Error('You must accept the terms and conditions');
                }
                return true;
            })
    ],

    // File upload validation
    avatar: [
        body("avatar")
            .optional()
            .custom((value, { req }) => {
                if (!req.file) return true;

                const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                if (!allowedMimeTypes.includes(req.file.mimetype)) {
                    throw new Error('Avatar must be a JPEG, PNG, GIF, or WebP image');
                }

                if (req.file.size > maxSize) {
                    throw new Error('Avatar image must be less than 5MB');
                }

                // Check image dimensions
                // This would require additional processing with a library like sharp
                return true;
            })
    ],

    // Bulk operations validation
    bulkOperations: [
        body("userIds")
            .isArray({ min: 1, max: 100 }).withMessage("User IDs must be an array with 1-100 items")
            .custom((value: string[]) => {
                const invalidIds = value.filter(id => !validationPatterns.objectId.test(id));
                if (invalidIds.length > 0) {
                    throw new Error(`Invalid user IDs: ${invalidIds.join(', ')}`);
                }
                return true;
            }),

        body("action")
            .isIn(['delete', 'activate', 'deactivate', 'suspend', 'unsuspend']).withMessage("Invalid bulk action")
    ]
};

export default userValidator3;
