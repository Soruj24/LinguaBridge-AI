import { UserStatus, UserRole, Permission } from "../../interfaces/IUser";

export const statusFields = {
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
    index: true
  },

  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    index: true
  },

  permissions: {
    type: [String],
    enum: Object.values(Permission),
    default: []
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },

  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: {
    type: String,
    select: false,
    validate: {
      validator: function (v: string) {
        return v === undefined || (v.length === 6 && /^[A-Z0-9]{6}$/.test(v));
      },
      message: 'Verification token must be 6 alphanumeric characters'
    }
  },

  emailVerificationExpires: {
    type: Date,
    select: false
  },

  isBanned: {
    type: Boolean,
    default: false,
    index: true
  },

  isSuspended: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
};
