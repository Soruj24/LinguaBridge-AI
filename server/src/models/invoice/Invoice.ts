import { model, Model } from 'mongoose';
import { invoiceSchema } from './invoiceSchema';
import { applyInvoiceStatics } from './invoiceStatics';
import { applyInvoiceMethods } from './invoiceMethods';
import { InvoiceDocument } from './invoiceTypes';

applyInvoiceStatics(invoiceSchema);
applyInvoiceMethods(invoiceSchema);
export const Invoice = model<InvoiceDocument, Model<InvoiceDocument>>('Invoice', invoiceSchema);
export default Invoice;
