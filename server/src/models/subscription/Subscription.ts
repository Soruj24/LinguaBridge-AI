import mongoose from 'mongoose';
import { subscriptionSchema } from './subscriptionSchema';
import { applySubscriptionStatics } from './subscriptionStatics';
import { applySubscriptionMethods } from './subscriptionMethods';
import { SubscriptionDocument } from './subscriptionTypes';

applySubscriptionStatics(subscriptionSchema);
applySubscriptionMethods(subscriptionSchema);
const Subscription = mongoose.model<SubscriptionDocument>(
  'Subscription',
  subscriptionSchema
) as mongoose.Model<SubscriptionDocument> & {
  findActiveByUserId: (userId: string) => Promise<SubscriptionDocument | null>;
  findExpiringSoon: (days?: number) => Promise<SubscriptionDocument[]>;
};

export default Subscription;
