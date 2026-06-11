import { body } from "express-validator";
import { Types } from "mongoose";

export const checkoutChains = {
  createCheckoutSession: [
    body("planId")
      .notEmpty()
      .withMessage("Plan ID is required")
      .isString()
      .withMessage("Plan ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid Plan ID format"),
    body("successUrl")
      .optional()
      .isURL()
      .withMessage("Success URL must be a valid URL"),
    body("cancelUrl")
      .optional()
      .isURL()
      .withMessage("Cancel URL must be a valid URL"),
  ],
};
