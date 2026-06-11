import mongoose, { Document, Types } from 'mongoose';
import { ISubscriptionPlan } from '../../types/billing.types';

export type SubscriptionDocument = Document &
  Omit<ISubscriptionPlan, 'id'> & {
    _id: Types.ObjectId;
    trialStart?: Date;
    trialEnd?: Date;
    billingCycleAnchor?: Date;
    id: Types.ObjectId;
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    status: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
    reactivatedAt?: Date;
    reactivatedBy?: Types.ObjectId;
    canceledBy?: Types.ObjectId;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
    cancel: (reason: string, userId: string) => void;
  };
