import mongoose from "mongoose";

export interface IAnalyticsEvent {
  user?: mongoose.Schema.Types.ObjectId;
  sessionId?: string;
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'purchase';
  data?: mongoose.Schema.Types.Mixed;
  deviceInfo?: {
    type: String;
    os: String;
    browser: String;
    isMobile: Boolean;
  };
  location?: {
    ip: String;
    country: String;
    city: String;
  };
  timestamp?: Date;
}
