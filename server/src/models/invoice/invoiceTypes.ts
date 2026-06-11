import mongoose, { Document } from 'mongoose';
import { IInvoice } from '../../types/billing.types';

export interface InvoiceDocument extends Document, Omit<IInvoice, 'id' | 'emailSentAt' | 'dueDate' | 'paidAt'> {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  paidAt?: Date;
  emailSentAt?: Date;
  isOverdue?: boolean;
}
