import { body, param, query } from "express-validator";
import { Types } from "mongoose";

export const adminBillingChains = {
  adminList: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("Limit must be between 1 and 200"),
    query("userId")
      .optional()
      .isString()
      .withMessage("User ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid user ID format"),
    query("status")
      .optional()
      .isString()
      .withMessage("Status must be a string")
      .isIn(["active", "canceled", "past_due", "trialing", "incomplete", "incomplete_expired", "unpaid", "paused"])
      .withMessage("Invalid subscription status"),
  ],

  adminUpdateSubscription: [
    param("subscriptionId")
      .notEmpty()
      .withMessage("Subscription ID is required")
      .isString()
      .withMessage("Subscription ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid subscription ID format"),
    body("action")
      .notEmpty()
      .withMessage("Action is required")
      .isString()
      .withMessage("Action must be a string")
      .isIn(["extend_trial", "apply_discount", "pause", "resume", "cancel", "reactivate"])
      .withMessage("Invalid admin action"),
    body("value")
      .optional()
      .custom((value, { req }) => {
        const action = req.body.action;
        if (action === "extend_trial") {
          return typeof value === "number" && value > 0 && value <= 365;
        }
        if (action === "apply_discount") {
          return typeof value === "number" && value >= 0 && value <= 100;
        }
        return true;
      })
      .withMessage("Invalid value for the specified action"),
    body("reason")
      .optional()
      .isString()
      .withMessage("Reason must be a string")
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("Reason must be between 5 and 500 characters"),
  ],
};
