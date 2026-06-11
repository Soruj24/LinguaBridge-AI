import { Schema } from 'mongoose';
import { InvoiceDocument } from './invoiceTypes';

export function applyInvoiceMethods(schema: Schema<InvoiceDocument>) {
  schema.methods.markAsPaid = function(paymentMethod?: string, paidAt?: Date) {
    this.status = 'paid';
    this.paidAt = paidAt || new Date();
    this.amountPaid = this.amountDue;
    this.amountRemaining = 0;
    if (paymentMethod) this.paymentMethod = paymentMethod;
    return this.save();
  };

  schema.methods.sendEmail = function() {
    this.emailSent = true;
    this.emailSentAt = new Date();
    return this.save();
  };
}
