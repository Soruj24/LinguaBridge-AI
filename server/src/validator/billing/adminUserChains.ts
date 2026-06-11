import { body, param } from "express-validator";

export const adminUserChains = {
  adminUpdateUser: [
    param("userId")
      .isMongoId()
      .withMessage("Valid user ID is required"),
    body("firstName")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),
    body("lastName")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("username")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    body("role")
      .optional()
      .isString()
      .isIn(["user", "admin", "moderator", "super_admin"])
      .withMessage("Role must be one of: user, admin, moderator, super_admin"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
    body("isBanned")
      .optional()
      .isBoolean()
      .withMessage("isBanned must be a boolean value"),
    body("status")
      .optional()
      .isString()
      .isIn(["active", "inactive", "suspended", "banned", "deleted"])
      .withMessage("Status must be one of: active, inactive, suspended, banned, deleted"),
  ],

  deleteUser: [
    param("userId")
      .isMongoId()
      .withMessage("Valid user ID is required"),
  ],

  adminCreateUser: [
    body("username")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("firstName")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),
    body("lastName")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
    body("role")
      .optional()
      .isString()
      .isIn(["user", "admin", "moderator", "super_admin"])
      .withMessage("Role must be one of: user, admin, moderator, super_admin"),
  ],

  updateUserRole: [
    param("userId")
      .isMongoId()
      .withMessage("Valid user ID is required"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isString()
      .isIn(["user", "admin", "moderator", "super_admin"])
      .withMessage("Role must be one of: user, admin, moderator, super_admin"),
  ],

  sendUserEmail: [
    param("userId")
      .isMongoId()
      .withMessage("Valid user ID is required"),
    body("subject")
      .notEmpty()
      .withMessage("Email subject is required")
      .isString()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Subject must be between 3 and 200 characters"),
    body("message")
      .notEmpty()
      .withMessage("Email message is required")
      .isString()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage("Message must be between 10 and 5000 characters"),
  ],
};
