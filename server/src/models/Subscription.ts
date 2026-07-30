import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface SubscriptionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  billingCycleAnchor?: Date;
  quantity?: number;
  latestInvoiceId?: string;
  defaultPaymentMethodId?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
  canceledBy?: Types.ObjectId;
  cancellationReason?: string;
  reactivatedAt?: Date;
  reactivatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isExpired: () => boolean;
  cancel: (reason?: string, canceledBy?: Types.ObjectId) => Promise<SubscriptionDocument>;
  reactivate: (reactivatedBy?: Types.ObjectId) => Promise<SubscriptionDocument>;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'], index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: [true, 'Plan ID is required'] },
    stripeSubscriptionId: { type: String, required: [true, 'Stripe subscription ID is required'], unique: true, trim: true },
    stripeCustomerId: { type: String, required: [true, 'Stripe customer ID is required'], trim: true },
    status: { type: String, required: [true, 'Subscription status is required'], enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'], default: 'active' },
    currentPeriodStart: { type: Date, required: [true, 'Current period start date is required'] },
    currentPeriodEnd: { type: Date, required: [true, 'Current period end date is required'] },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    trialStart: { type: Date },
    trialEnd: { type: Date },
    billingCycleAnchor: { type: Date },
    quantity: { type: Number, default: 1, min: [1, 'Quantity must be at least 1'] },
    latestInvoiceId: { type: String, trim: true },
    defaultPaymentMethodId: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    canceledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, trim: true },
    reactivatedAt: { type: Date },
    reactivatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: function (doc, ret) { delete ret._id; delete ret.__v; delete ret.createdAt; delete ret.updatedAt; delete ret.metadata; delete ret.stripeSubscriptionId; delete ret.stripeCustomerId; delete ret.canceledBy; delete ret.reactivatedBy; return ret; } },
    toObject: { virtuals: true, transform: function (doc, ret) { delete ret._id; delete ret.__v; return ret; } },
  }
);

subscriptionSchema.virtual('durationDays').get(function (this: SubscriptionDocument) {
  return Math.ceil((this.currentPeriodEnd.getTime() - this.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
});
subscriptionSchema.virtual('daysRemaining').get(function (this: SubscriptionDocument) {
  const now = new Date();
  if (now > this.currentPeriodEnd) return 0;
  return Math.ceil((this.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});
subscriptionSchema.virtual('isTrialing').get(function (this: SubscriptionDocument) { return this.status === 'trialing'; });
subscriptionSchema.virtual('isActiveSubscription').get(function (this: SubscriptionDocument) { return this.status === 'active' || this.status === 'trialing'; });
subscriptionSchema.virtual('isPastDue').get(function (this: SubscriptionDocument) { return this.status === 'past_due'; });
subscriptionSchema.virtual('isCanceled').get(function (this: SubscriptionDocument) { return this.status === 'canceled'; });
subscriptionSchema.virtual('plan', { ref: 'SubscriptionPlan', localField: 'planId', foreignField: '_id', justOne: true });
subscriptionSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ cancelAtPeriodEnd: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ createdAt: -1 });

subscriptionSchema.pre('save', function (next) {
  const now = new Date();
  if (this.isModified('status') && this.status === 'canceled' && !this.canceledAt) this.canceledAt = now;
  if (this.isModified('status') && (this.status === 'active' || this.status === 'trialing') && this.reactivatedAt === undefined) this.reactivatedAt = now;
  next();
});

subscriptionSchema.methods.isExpired = function () { return new Date() > this.currentPeriodEnd; };
subscriptionSchema.methods.cancel = function (reason?: string, canceledBy?: Types.ObjectId) {
  this.status = 'canceled'; this.cancelAtPeriodEnd = true; this.canceledAt = new Date();
  if (reason) this.cancellationReason = reason;
  if (canceledBy) this.canceledBy = canceledBy;
  return this.save();
};
subscriptionSchema.methods.reactivate = function (reactivatedBy?: Types.ObjectId) {
  this.status = 'active'; this.cancelAtPeriodEnd = false; this.reactivatedAt = new Date();
  if (reactivatedBy) this.reactivatedBy = reactivatedBy;
  return this.save();
};

subscriptionSchema.statics.findActiveByUserId = function (userId: string) {
  return this.findOne({ userId, status: { $in: ['active', 'trialing'] } });
};
subscriptionSchema.statics.findExpiringSoon = function (days: number = 7) {
  const date = new Date(); date.setDate(date.getDate() + days);
  return this.find({ status: { $in: ['active', 'trialing'] }, currentPeriodEnd: { $lte: date } });
};

const Subscription = mongoose.model<SubscriptionDocument>(
  'Subscription', subscriptionSchema
) as mongoose.Model<SubscriptionDocument> & {
  findActiveByUserId: (userId: string) => Promise<SubscriptionDocument | null>;
  findExpiringSoon: (days?: number) => Promise<SubscriptionDocument[]>;
};

export default Subscription;
export { Subscription };
