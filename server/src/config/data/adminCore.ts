import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Gender, UserRole, UserStatus, Permission } from "../../models/interfaces/IUser";
import { getUnsplashAvatar, generateValidPhoneNumber, generateHashedPassword } from "./helpers";

export const generateAdminUser = async (
  usedUsernames: Set<string>,
  usedEmails: Set<string>
) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    username: "admin_user",
    email: "admin@example.com",
    password: await generateHashedPassword("admin123"),
    firstName: "System",
    lastName: "Administrator",
    displayName: "System Administrator",
    avatar: {
      url: getUnsplashAvatar(),
      publicId: `avatar-admin-${faker.string.uuid()}`,
    },
    role: UserRole.ADMIN,
    permissions: [
      Permission.USERS_VIEW,
      Permission.USERS_CREATE,
      Permission.USERS_EDIT,
      Permission.ANALYTICS_VIEW,
    ],
    status: UserStatus.ACTIVE,
    isVerified: true,
    emailVerified: true,
    isActive: true,
    phone: generateValidPhoneNumber(),
    phoneVerified: true,
    gender: Gender.MALE,
    dateOfBirth: new Date("1985-01-01"),
    userLanguage: "en",
    timezone: "UTC",
    registrationIP: faker.internet.ipv4(),
    detectedCountry: "BD",
    preferences: {
      notifications: { email: true, sms: false, push: true, marketing: false, security: true, social: true, system: true },
      privacy: { profileVisibility: "public", showEmail: false, showPhone: false, showOnlineStatus: true, showLastSeen: true, allowFriendRequests: true, allowDirectMessages: true, searchable: true },
      security: { requireTwoFactorForPasswordChange: true, requireTwoFactorForEmailChange: true, sessionTimeout: 60, allowMultipleSessions: true, suspiciousActivityAlerts: true },
      language: "en", currency: "USD", timezone: "UTC", dateFormat: "YYYY-MM-DD", timeFormat: "24",
    },
    addresses: [
      { type: "home", street: "123 Admin Street", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true },
    ],
    loginCount: faker.number.int({ min: 50, max: 200 }),
    lastLoginAt: new Date(),
    accountCreatedAt: new Date(),
    metadata: {
      userAgent: faker.internet.userAgent(),
      initialCountry: "BD",
      signupFlow: "direct",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  usedUsernames.add("admin_user");
  usedEmails.add("admin@example.com");
  return user;
};

export const generateSuperAdminUser = async (
  usedUsernames: Set<string>,
  usedEmails: Set<string>
) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    username: "super_admin",
    email: "superadmin@example.com",
    password: await generateHashedPassword("superadmin123"),
    firstName: "Super",
    lastName: "Admin",
    displayName: "Super Admin",
    avatar: {
      url: getUnsplashAvatar(),
      publicId: `avatar-superadmin-${faker.string.uuid()}`,
    },
    role: UserRole.SUPER_ADMIN,
    permissions: Object.values(Permission),
    status: UserStatus.ACTIVE,
    isVerified: true,
    emailVerified: true,
    isActive: true,
    phone: generateValidPhoneNumber(),
    phoneVerified: true,
    gender: Gender.MALE,
    dateOfBirth: new Date("1980-01-01"),
    userLanguage: "en",
    timezone: "UTC",
    registrationIP: faker.internet.ipv4(),
    detectedCountry: "BD",
    preferences: {
      notifications: { email: true, sms: false, push: true, marketing: false, security: true, social: true, system: true },
      privacy: { profileVisibility: "private", showEmail: false, showPhone: false, showOnlineStatus: true, showLastSeen: false, allowFriendRequests: false, allowDirectMessages: false, searchable: false },
      security: { requireTwoFactorForPasswordChange: true, requireTwoFactorForEmailChange: true, sessionTimeout: 30, allowMultipleSessions: false, suspiciousActivityAlerts: true },
      language: "en", currency: "USD", timezone: "UTC", dateFormat: "YYYY-MM-DD", timeFormat: "24",
    },
    addresses: [
      { type: "work", street: "456 Super Admin Ave", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true },
    ],
    loginCount: faker.number.int({ min: 100, max: 300 }),
    lastLoginAt: new Date(),
    accountCreatedAt: new Date(),
    metadata: {
      userAgent: faker.internet.userAgent(),
      initialCountry: "BD",
      signupFlow: "direct",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  usedUsernames.add("super_admin");
  usedEmails.add("superadmin@example.com");
  return user;
};
