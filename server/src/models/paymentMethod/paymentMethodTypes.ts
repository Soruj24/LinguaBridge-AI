import mongoose, { Document } from 'mongoose';

export interface PaymentMethodData {
  stripePaymentMethodId: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  fingerprint?: string;
  country?: string;
  funding?: 'credit' | 'debit' | 'prepaid' | 'unknown';
  network?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface PaymentMethodDocument extends PaymentMethodData, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
