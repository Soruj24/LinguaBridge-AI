import mongoose from "mongoose";

export interface INotification {
  user: mongoose.Schema.Types.ObjectId;
  type: 'order_update' | 'price_drop' | 'stock_alert' | 'promotion';
  title: string;
  message: string;
  data?: mongoose.Schema.Types.Mixed;
  isRead?: boolean;
  sentAt?: Date;
}
