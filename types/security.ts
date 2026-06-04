export interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  otpauthUrl: string;
}

export interface LoginActivity {
  _id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  type: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
}

export interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActive: string;
  current: boolean;
}
