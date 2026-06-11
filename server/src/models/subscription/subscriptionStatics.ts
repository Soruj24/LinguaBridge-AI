import { Schema } from 'mongoose';
import { SubscriptionDocument } from './subscriptionTypes';

export function applySubscriptionStatics(schema: Schema<SubscriptionDocument>) {
  schema.statics.findActiveByUserId = function (userId: string) {
    return this.findOne({ userId, status: { $in: ['active', 'trialing'] } });
  };

  schema.statics.findExpiringSoon = function (days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.find({ status: { $in: ['active', 'trialing'] }, currentPeriodEnd: { $lte: date } });
  };
}
