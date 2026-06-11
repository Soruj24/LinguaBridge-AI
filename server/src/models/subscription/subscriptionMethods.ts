import { Schema, Types } from 'mongoose';
import { SubscriptionDocument } from './subscriptionTypes';

export function applySubscriptionMethods(schema: Schema<SubscriptionDocument>) {
  schema.methods.isExpired = function () {
    return new Date() > this.currentPeriodEnd;
  };

  schema.methods.cancel = function (reason?: string, canceledBy?: Types.ObjectId) {
    this.status = 'canceled';
    this.cancelAtPeriodEnd = true;
    this.canceledAt = new Date();
    if (reason) this.cancellationReason = reason;
    if (canceledBy) this.canceledBy = canceledBy;
    return this.save();
  };

  schema.methods.reactivate = function (reactivatedBy?: Types.ObjectId) {
    this.status = 'active';
    this.cancelAtPeriodEnd = false;
    this.reactivatedAt = new Date();
    if (reactivatedBy) this.reactivatedBy = reactivatedBy;
    return this.save();
  };
}
