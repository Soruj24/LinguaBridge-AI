import { Document, Types } from "mongoose";

export interface IChat extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
  groupAdmin?: Types.ObjectId;
  folderId?: Types.ObjectId;
  alwaysTranslate: boolean;
  autoTranslateLanguage?: string;
  markedUnreadBy: Types.ObjectId[];
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
