import mongoose, { Schema, model, Model, Document, Types } from 'mongoose';

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'draft' | 'open' | 'void' | 'uncollectible';
  pdfUrl?: string;
  paymentMethod?: string;
  description?: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  paidAt?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  amountDue?: number;
  amountPaid?: number;
  amountRemaining?: number;
  billingReason?: string;
  metadata?: Record<string, any>;
  isFinalized?: boolean;
  finalizedAt?: string;
  emailSent?: boolean;
  emailSentAt?: string;
}

export interface InvoiceDocument extends Document, Omit<IInvoice, 'id' | 'emailSentAt' | 'dueDate' | 'paidAt'> {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  paidAt?: Date;
  emailSentAt?: Date;
  isOverdue?: boolean;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'], index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', index: true },
    stripeInvoiceId: { type: String, required: [true, 'Stripe invoice ID is required'], unique: true, trim: true },
    invoiceNumber: { type: String, required: [true, 'Invoice number is required'], unique: true, trim: true },
    date: { type: Date, required: [true, 'Invoice date is required'], default: Date.now },
    amount: { type: Number, required: [true, 'Invoice amount is required'], min: [0, 'Amount cannot be negative'] },
    currency: { type: String, required: [true, 'Currency is required'], default: 'USD', uppercase: true, enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] },
    status: { type: String, required: [true, 'Invoice status is required'], enum: ['draft', 'open', 'paid', 'void', 'uncollectible', 'pending', 'failed', 'refunded'], default: 'draft' },
    pdfUrl: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    description: { type: String, trim: true },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    dueDate: { type: Date },
    paidAt: { type: Date },
    hostedInvoiceUrl: { type: String, trim: true },
    invoicePdf: { type: String, trim: true },
    total: { type: Number, default: 0, min: [0, 'Total cannot be negative'] },
    subtotal: { type: Number, default: 0, min: [0, 'Subtotal cannot be negative'] },
    tax: { type: Number, default: 0, min: [0, 'Tax cannot be negative'] },
    discount: { type: Number, default: 0, min: [0, 'Discount cannot be negative'] },
    amountDue: { type: Number, default: 0, min: [0, 'Amount due cannot be negative'] },
    amountPaid: { type: Number, default: 0, min: [0, 'Amount paid cannot be negative'] },
    amountRemaining: { type: Number, default: 0, min: [0, 'Amount remaining cannot be negative'] },
    billingReason: { type: String, enum: ['subscription_create', 'subscription_cycle', 'subscription_update', 'subscription', 'manual', 'upcoming', 'subscription_threshold'], default: 'subscription_cycle' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isFinalized: { type: Boolean, default: false },
    finalizedAt: { type: Date },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: function(doc, ret) { delete ret._id; delete ret.__v; delete ret.createdAt; delete ret.updatedAt; delete ret.metadata; delete ret.stripeInvoiceId; delete ret.isFinalized; delete ret.finalizedAt; delete ret.emailSent; delete ret.emailSentAt; return ret; } },
    toObject: { virtuals: true, transform: function(doc, ret) { delete ret._id; delete ret.__v; return ret; } },
  }
);

invoiceSchema.virtual('formattedAmount').get(function(this: InvoiceDocument) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency }).format(this.amount);
});
invoiceSchema.virtual('formattedTotal').get(function(this: InvoiceDocument) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency }).format(this.total ?? 0);
});
invoiceSchema.virtual('isPaid').get(function(this: InvoiceDocument) { return this.status === 'paid'; });
invoiceSchema.virtual('isOverdue').get(function(this: InvoiceDocument) {
  if (!this.dueDate || this.status === 'paid') return false;
  return new Date() > new Date(this.dueDate);
});
invoiceSchema.virtual('daysOverdue').get(function(this: InvoiceDocument) {
  if (!this.isOverdue) return 0;
  const now = new Date(); const dueDate = new Date(this.dueDate!);
  return Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
});
invoiceSchema.virtual('subscription', { ref: 'Subscription', localField: 'subscriptionId', foreignField: '_id', justOne: true });
invoiceSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

invoiceSchema.index({ userId: 1, date: -1 });
invoiceSchema.index({ stripeInvoiceId: 1 }, { unique: true });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ subscriptionId: 1 });
invoiceSchema.index({ date: -1 });
invoiceSchema.index({ paidAt: 1 });
invoiceSchema.index({ amountDue: 1 });
invoiceSchema.index({ emailSent: 1, date: 1 });

invoiceSchema.pre<InvoiceDocument>('save', async function (next) {
  if (!this.invoiceNumber) {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
    const lastInvoiceDoc = await mongoose.model<InvoiceDocument>('Invoice').findOne({ invoiceNumber: new RegExp('^INV-' + yearMonth + '-') }).sort({ invoiceNumber: -1 });
    let sequence = 1;
    if (lastInvoiceDoc) sequence = parseInt(lastInvoiceDoc.invoiceNumber.split('-')[2], 10) + 1;
    this.invoiceNumber = 'INV-' + yearMonth + '-' + sequence.toString().padStart(4, '0');
  }
  if (!this.dueDate) { const dueDate = new Date(this.date); dueDate.setDate(dueDate.getDate() + 30); this.dueDate = dueDate; }
  if (this.amount && !this.total) this.total = this.amount;
  if (this.total && !this.amountDue) this.amountDue = this.total - (this.amountPaid || 0);
  if (!this.amountRemaining) this.amountRemaining = (this.amountDue ?? 0) - (this.amountPaid ?? 0);
  next();
});

invoiceSchema.methods.markAsPaid = function(paymentMethod?: string, paidAt?: Date) {
  this.status = 'paid'; this.paidAt = paidAt || new Date(); this.amountPaid = this.amountDue; this.amountRemaining = 0;
  if (paymentMethod) this.paymentMethod = paymentMethod;
  return this.save();
};
invoiceSchema.methods.sendEmail = function() { this.emailSent = true; this.emailSentAt = new Date(); return this.save(); };

invoiceSchema.statics.findByUserId = function(userId: string, options: any = {}) {
  const query = this.find({ userId });
  if (options.status) query.where('status', options.status);
  if (options.startDate) query.where('date').gte(options.startDate);
  if (options.endDate) query.where('date').lte(options.endDate);
  if (options.sortBy) { const sortOrder = options.sortOrder === 'desc' ? -1 : 1; query.sort({ [options.sortBy]: sortOrder }); }
  else query.sort({ date: -1 });
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query;
};
invoiceSchema.statics.findOverdue = function() {
  const now = new Date();
  return this.find({
    status: { $nin: ['paid', 'void'] },
    dueDate: { $lt: now },
  });
};
invoiceSchema.statics.getTotalRevenue = async function(startDate?: Date, endDate?: Date) {
  const match: any = { status: 'paid' };
  if (startDate) match.date = { $gte: startDate };
  if (endDate) { match.date = match.date || {}; match.date.$lte = endDate; }
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  return result[0] || { totalRevenue: 0, count: 0 };
};

const Invoice = model<InvoiceDocument, Model<InvoiceDocument>>('Invoice', invoiceSchema);
export default Invoice;
export { Invoice };
