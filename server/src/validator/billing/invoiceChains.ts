import { param, query } from "express-validator";
import { Types } from "mongoose";

export const invoiceChains = {
  getInvoices: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isString()
      .withMessage("Status must be a string")
      .isIn(["paid", "pending", "failed", "refunded", "draft", "open", "void", "uncollectible"])
      .withMessage("Invalid invoice status"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO date"),
    query("sortBy")
      .optional()
      .isString()
      .withMessage("Sort by must be a string")
      .isIn(["date", "amount", "status", "invoiceNumber"])
      .withMessage("Invalid sort field"),
    query("sortOrder")
      .optional()
      .isString()
      .withMessage("Sort order must be a string")
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be 'asc' or 'desc'"),
  ],

  downloadInvoice: [
    param("invoiceId")
      .notEmpty()
      .withMessage("Invoice ID is required")
      .isString()
      .withMessage("Invoice ID must be a string")
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage("Invalid invoice ID format"),
  ],
};
