import { Schema } from 'mongoose';
import { PaymentMethodDocument } from './paymentMethodTypes';

export function applyPaymentMethodStatics(schema: Schema<PaymentMethodDocument>) {
  schema.statics.findDefaultByUserId = function(userId: string) {
    return this.findOne({ userId, isDefault: true, isActive: true, deletedAt: null });
  };

  schema.statics.findActiveByUserId = function(userId: string) {
    return this.find({ userId, isActive: true, deletedAt: null }).sort({ isDefault: -1, createdAt: -1 });
  };
}
