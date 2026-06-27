export interface LoginNotificationData {
  name: string;
  email: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress?: string;
  location?: string;
  timestamp: Date;
}

export interface SuspiciousActivityData {
  name: string;
  email: string;
  reason: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}
