import { UserSummary } from "./user.types";

export interface Chat {
  _id: string;
  participants: UserSummary[];
  alwaysTranslate?: boolean;
  autoTranslateLanguage?: string | null;
  markedUnreadBy?: string[];
  isArchived?: boolean;
  archivedAt?: string | null;
}

export interface Folder {
  _id: string;
  name: string;
  color: string;
  order: number;
  chatIds: string[];
  createdAt: string;
}

export interface PhrasebookEntry {
  _id: string;
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  sourceMessageId?: string;
  sourceChatId?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "order_update" | "price_drop" | "stock_alert" | "promotion";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  sentAt?: Date;
}
