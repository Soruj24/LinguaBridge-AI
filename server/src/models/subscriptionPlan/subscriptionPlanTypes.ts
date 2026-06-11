import mongoose, { Document, Schema } from 'mongoose';
import { ISubscriptionPlan } from '../../types/billing.types';

export interface SubscriptionPlanDocument extends Document, Omit<ISubscriptionPlan, 'id'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
