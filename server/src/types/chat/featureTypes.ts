import { Document, Types } from "mongoose";

export interface IPhrasebookEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  originalText: string;
  translatedText: string;
  languageFrom: string;
  languageTo: string;
  sourceMessageId?: Types.ObjectId;
  sourceChatId?: Types.ObjectId;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  color: string;
  order: number;
  chatIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  reportedUser: Types.ObjectId;
  reason: "spam" | "harassment" | "inappropriate" | "fake_account" | "other";
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}
