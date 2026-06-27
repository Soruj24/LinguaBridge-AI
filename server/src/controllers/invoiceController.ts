import { Response, NextFunction } from "express";
import createError from "http-errors";
import { successResponse } from "./responsControllers";
import { AuthRequest } from "../types";
import Invoice from "../models/Invoice";
import { asyncHandler } from "../middleware/asyncHandler";
import { sanitizeBillingData, getStripe } from "./billingHelpers";

const handleGetInvoices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [invoices, total] = await Promise.all([Invoice.find({ userId }).sort({ date: -1 }).limit(limit).skip((page - 1) * limit), Invoice.countDocuments({ userId })]);
    return successResponse(res, { statusCode: 200, message: "Invoices retrieved", payload: { invoices: invoices.map((i) => sanitizeBillingData(i.toObject())), pagination: { totalInvoices: total, totalPages: Math.ceil(total / limit), currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page < Math.ceil(total / limit) ? page + 1 : null } } });
  } catch (error) { return next(createError(500, "Failed to retrieve invoices")); }
});

const handleDownloadInvoice = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { invoiceId } = req.params;
    const invoice = await Invoice.findOne({ _id: invoiceId, userId });
    if (!invoice) return next(createError(404, "Invoice not found"));
    if ((invoice as any).stripeInvoiceId) {
      const stripe = getStripe();
      const si = await stripe.invoices.retrieve((invoice as any).stripeInvoiceId);
      if (si.invoice_pdf) return res.redirect(si.invoice_pdf);
    }
    return next(createError(404, "Invoice PDF not available"));
  } catch (error: any) { return next(error.type === "StripeInvalidRequestError" ? createError(400, error.message) : createError(500, "Failed to download invoice")); }
});

export { handleGetInvoices, handleDownloadInvoice };
