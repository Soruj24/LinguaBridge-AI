import { body, param } from "express-validator";
import { Types } from "mongoose";

export const paymentMethodChains = {
  addPaymentMethod: [
    body("paymentMethodId")
      .notEmpty()
      .withMessage("Payment method ID is required")
      .isString()
      .withMessage("Payment method ID must be a string")
      .matches(/^(pm|ba)_[a-zA-Z0-9]+$/)
      .withMessage("Invalid payment method ID format"),
    body("type")
      .optional()
      .isString()
      .withMessage("Type must be a string")
      .isIn(["card", "bank_account", "paypal"])
      .withMessage("Invalid payment method type"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
  ],

  setDefaultPaymentMethod: [
    param("paymentMethodId")
      .notEmpty()
      .withMessage("Payment method ID is required")
      .isString()
      .withMessage("Payment method ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid payment method ID format"),
  ],

  removePaymentMethod: [
    param("paymentMethodId")
      .notEmpty()
      .withMessage("Payment method ID is required")
      .isString()
      .withMessage("Payment method ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid payment method ID format"),
  ],
};
