import { Schema } from 'mongoose';
import { PaymentMethodDocument } from './paymentMethodTypes';

export function applyPaymentMethodMethods(schema: Schema<PaymentMethodDocument>) {
  schema.methods.softDelete = function() {
    this.isActive = false;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function() {
    this.isActive = true;
    this.deletedAt = null;
    return this.save();
  };
}
