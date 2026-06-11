import { body } from "express-validator";
import { Types } from "mongoose";

export const subscriptionChains = {
  createSubscription: [
    body("planId")
      .notEmpty()
      .withMessage("Plan ID is required")
      .isString()
      .withMessage("Plan ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid Plan ID format"),
    body("paymentMethodId")
      .optional()
      .isString()
      .withMessage("Payment method ID must be a string")
      .isLength({ min: 5 })
      .withMessage("Invalid payment method ID"),
    body("couponCode")
      .optional()
      .isString()
      .withMessage("Coupon code must be a string")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Coupon code must be between 3 and 50 characters"),
  ],

  updateSubscription: [
    body("planId")
      .notEmpty()
      .withMessage("Plan ID is required")
      .isString()
      .withMessage("Plan ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid Plan ID format"),
  ],
};
