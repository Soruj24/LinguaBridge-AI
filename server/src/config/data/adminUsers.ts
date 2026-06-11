import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Gender, UserRole, UserStatus, Permission } from "../../models/interfaces/IUser";
import { getUnsplashAvatar, generateValidPhoneNumber, generateHashedPassword } from "./helpers";
import { generateAdminUser, generateSuperAdminUser } from "./adminCore";

export const generateModeratorUser = async (
  usedUsernames: Set<string>,
  usedEmails: Set<string>
) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    username: "moderator_user",
    email: "moderator@example.com",
    password: await generateHashedPassword("moderator123"),
    firstName: "System",
    lastName: "Moderator",
    displayName: "System Moderator",
    avatar: {
      url: getUnsplashAvatar(),
      publicId: `avatar-moderator-${faker.string.uuid()}`,
    },
    role: UserRole.MODERATOR,
    permissions: [
      Permission.USERS_VIEW,
      Permission.CONTENT_VIEW,
      Permission.CONTENT_CREATE,
      Permission.CONTENT_EDIT,
      Permission.TICKETS_VIEW,
      Permission.TICKETS_EDIT,
    ],
    status: UserStatus.ACTIVE,
    isVerified: true,
    emailVerified: true,
    isActive: true,
    phone: generateValidPhoneNumber(),
    phoneVerified: true,
    gender: Gender.FEMALE,
    dateOfBirth: new Date("1990-01-01"),
    userLanguage: "en",
    timezone: "UTC",
    registrationIP: faker.internet.ipv4(),
    detectedCountry: "BD",
    preferences: {
      notifications: { email: true, sms: true, push: true, marketing: false, security: true, social: true, system: true },
      privacy: { profileVisibility: "public", showEmail: false, showPhone: false, showOnlineStatus: true, showLastSeen: true, allowFriendRequests: true, allowDirectMessages: true, searchable: true },
      security: { requireTwoFactorForPasswordChange: true, requireTwoFactorForEmailChange: false, sessionTimeout: 60, allowMultipleSessions: true, suspiciousActivityAlerts: true },
      language: "en", currency: "USD", timezone: "UTC", dateFormat: "YYYY-MM-DD", timeFormat: "24",
    },
    addresses: [
      { type: "work", street: "789 Mod Plaza", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true },
    ],
    loginCount: faker.number.int({ min: 20, max: 100 }),
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
  usedUsernames.add("moderator_user");
  usedEmails.add("moderator@example.com");
  return user;
};

export const generateAdminUsers = async (
  usedUsernames: Set<string>,
  usedEmails: Set<string>
): Promise<any[]> => {
  const users: any[] = [];
  users.push(await generateAdminUser(usedUsernames, usedEmails));
  users.push(await generateSuperAdminUser(usedUsernames, usedEmails));
  users.push(await generateModeratorUser(usedUsernames, usedEmails));
  return users;
};
