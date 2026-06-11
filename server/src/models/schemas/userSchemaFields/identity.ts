import { Schema } from "mongoose";
import validator from "validator";
import { USER_CONSTANTS } from "../../constants/UserConstants";
import { Gender } from "../../interfaces/IUser";
import { avatarSchema } from "../subSchemas";
import { isStrongPassword } from "../../utils/UserUtils";

export const identityFields = {
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [USER_CONSTANTS.USERNAME.MIN_LENGTH, `Username must be at least ${USER_CONSTANTS.USERNAME.MIN_LENGTH} characters long`],
    maxlength: [USER_CONSTANTS.USERNAME.MAX_LENGTH, `Username cannot exceed ${USER_CONSTANTS.USERNAME.MAX_LENGTH} characters`],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_.-]+$/, "Username can only contain alphanumeric characters, dots, hyphens, and underscores"],
    index: true,
    validate: {
      validator: function (this: any, username: string) {
        if (this && this.status === 'deleted') return true;
        return !USER_CONSTANTS.USERNAME.RESERVED.includes(username.toLowerCase() as any);
      },
      message: 'This username is reserved'
    }
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(this: any, value: string) {
        if (this && this.status === 'deleted') return true;
        return validator.isEmail(value);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },

  password: {
    type: String,
    minlength: [USER_CONSTANTS.PASSWORD.MIN_LENGTH, `Password must be at least ${USER_CONSTANTS.PASSWORD.MIN_LENGTH} characters long`],
    select: false,
    validate: {
      validator: isStrongPassword,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }
  },

  firstName: {
    type: String,
    trim: true,
    maxlength: [USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH, `First name cannot exceed ${USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH} characters`],
    match: [/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"]
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: [USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH, `Last name cannot exceed ${USER_CONSTANTS.LIMITS.NAME_MAX_LENGTH} characters`],
    match: [/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"]
  },

  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },

  avatar: avatarSchema,

  phone: {
    type: String,
    validate: {
      validator: (phone: string) => validator.isMobilePhone(phone, 'any', { strictMode: false }),
      message: 'Please provide a valid phone number'
    }
  },

  phoneVerified: {
    type: Boolean,
    default: false
  },

  dateOfBirth: {
    type: Date,
    validate: {
      validator: function (dob: Date) {
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 13 && age <= 120;
      },
      message: 'You must be at least 13 years old and not older than 120 years'
    }
  },

  gender: {
    type: String,
    enum: Object.values(Gender)
  },

  bio: {
    type: String,
    maxlength: [USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH, `Bio cannot exceed ${USER_CONSTANTS.LIMITS.BIO_MAX_LENGTH} characters`],
    trim: true
  },

  website: {
    type: String,
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: 'Please provide a valid website URL'
    }
  },

  socialLinks: {
    type: Map,
    of: String
  }
};
