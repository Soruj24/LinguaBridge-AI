export interface UserData {
  username: string;
  userLanguage: string;
  language: string;
  socketId: string;
  rememberSession: boolean;
  joinedAt?: Date;
  sessionRestored?: boolean;
}

export interface ConnectedUsers {
  get(socketId: string): UserData | undefined;
  set(socketId: string, userData: UserData): void;
  delete(socketId: string): void;
  entries(): IterableIterator<[string, UserData]>;
  values(): IterableIterator<UserData>;
}

export interface JoinData {
  username: string;
  userLanguage: string;
  rememberSession?: boolean;
}

export interface RestoreSessionData {
  username: string;
  force?: boolean;
}

export interface AutoJoinData {
  force?: boolean;
  username?: string;
}

export interface ConnectionCheckResponse {
  connected: boolean;
  authenticated: boolean;
  username?: string;
  timestamp: string;
}

export interface JoinSuccessData {
  message: string;
  users: Array<{
    username: string;
    userLanguage: string;
  }>;
  groups: any[];
  onlineUsers: string[];
  userLanguages: Record<string, string>;
  rememberSession?: boolean;
  autoJoinEnabled?: boolean;
  autoJoined?: boolean;
  sessionRestored?: boolean;
}

export interface AuthErrorData {
  message: string;
  event: string;
  requireRejoin: boolean;
  autoJoinFailed: boolean;
}

export interface JoinErrorData {
  error: string;
  autoJoinAvailable: boolean;
}

export interface UserOnlineData {
  username: string;
  userLanguage?: string;
  autoJoined?: boolean;
  manuallyJoined?: boolean;
  sessionRestored?: boolean;
}

export interface UserOfflineData {
  username: string;
  reason?: string;
}

export interface MultipleSessionWarningData {
  message: string;
  newConnection?: boolean;
}

export interface AutoJoinSuccessData {
  username: string;
  userLanguage: string;
  message: string;
  autoJoined?: boolean;
}
