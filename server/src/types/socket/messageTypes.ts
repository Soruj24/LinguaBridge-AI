export interface SendMessageData {
  to: string;
  message: string;
  type?: 'text' | 'voice' | 'image' | 'file';
}

export interface SendGroupMessageData {
  groupId: string;
  message: string;
  type?: 'text' | 'voice' | 'image' | 'file';
}

export interface FetchMessagesData {
  withUser: string;
  limit?: number;
  skip?: number;
}

export interface FetchGroupMessagesData {
  groupId: string;
  limit?: number;
  skip?: number;
}

export interface MessageResponse {
  success: boolean;
  message?: any;
  error?: string;
  messages?: any[];
}

export interface NewMessageData {
  _id?: string;
  from: string;
  to?: string;
  groupId?: string;
  message: string;
  type: 'text' | 'voice' | 'image' | 'file';
  timestamp: Date;
  readBy?: Array<{
    username: string;
    readAt: Date;
  }>;
  deliveredTo?: string[];
}

export interface NewGroupMessageData extends NewMessageData {
  groupId: string;
}
