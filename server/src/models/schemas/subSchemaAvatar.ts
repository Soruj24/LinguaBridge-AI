import { Schema } from "mongoose";
import validator from "validator";
import { IAvatar } from "../interfaces/IUser";

export const avatarSchema = new Schema<IAvatar>({
  url: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: 'Invalid avatar URL'
    }
  },
  publicId: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: 'Invalid thumbnail URL'
    }
  },
  originalName: String,
  size: Number,
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });
