import { model } from 'mongoose';
import { subscriptionPlanSchema } from './subscriptionPlanSchema';
import { SubscriptionPlanDocument } from './subscriptionPlanTypes';

const SubscriptionPlan = model<SubscriptionPlanDocument>('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
