import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Gender, UserRole, UserStatus, Permission } from "../../models/interfaces/IUser";
import { getUnsplashAvatar, generateValidPhoneNumber, generateValidUsername, generateHashedPassword } from "./helpers";

const DEFAULT_PREFERENCES = {
  notifications: { email: true, sms: false, push: true, marketing: false, security: true, social: true, system: true },
  privacy: { profileVisibility: "public" as const, showEmail: false, showPhone: false, showOnlineStatus: true, showLastSeen: true, allowFriendRequests: true, allowDirectMessages: true, searchable: true },
  security: { requireTwoFactorForPasswordChange: true, requireTwoFactorForEmailChange: true, sessionTimeout: 60, allowMultipleSessions: true, suspiciousActivityAlerts: true },
  language: "en", currency: "USD", timezone: "UTC", dateFormat: "YYYY-MM-DD", timeFormat: "24",
};

async function createAdminUser() {
  return {
    _id: new mongoose.Types.ObjectId(),
    username: "admin_user",
    email: "admin@example.com",
    password: await generateHashedPassword("admin123"),
    firstName: "System", lastName: "Administrator", displayName: "System Administrator",
    avatar: { url: getUnsplashAvatar(), publicId: `avatar-admin-${faker.string.uuid()}` },
    role: UserRole.ADMIN,
    permissions: [Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT, Permission.ANALYTICS_VIEW],
    status: UserStatus.ACTIVE, isVerified: true, emailVerified: true, isActive: true,
    phone: generateValidPhoneNumber(), phoneVerified: true, gender: Gender.MALE,
    dateOfBirth: new Date("1985-01-01"), userLanguage: "en", timezone: "UTC",
    registrationIP: faker.internet.ipv4(), detectedCountry: "BD",
    preferences: { ...DEFAULT_PREFERENCES, privacy: { ...DEFAULT_PREFERENCES.privacy, profileVisibility: "public" as const } },
    addresses: [{ type: "home", street: "123 Admin Street", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true }],
    loginCount: faker.number.int({ min: 50, max: 200 }), lastLoginAt: new Date(), accountCreatedAt: new Date(),
    metadata: { userAgent: faker.internet.userAgent(), initialCountry: "BD", signupFlow: "direct" },
    createdAt: new Date(), updatedAt: new Date(),
  };
}

async function createSuperAdminUser() {
  return {
    _id: new mongoose.Types.ObjectId(),
    username: "super_admin",
    email: "superadmin@example.com",
    password: await generateHashedPassword("superadmin123"),
    firstName: "Super", lastName: "Admin", displayName: "Super Admin",
    avatar: { url: getUnsplashAvatar(), publicId: `avatar-superadmin-${faker.string.uuid()}` },
    role: UserRole.SUPER_ADMIN, permissions: Object.values(Permission),
    status: UserStatus.ACTIVE, isVerified: true, emailVerified: true, isActive: true,
    phone: generateValidPhoneNumber(), phoneVerified: true, gender: Gender.MALE,
    dateOfBirth: new Date("1980-01-01"), userLanguage: "en", timezone: "UTC",
    registrationIP: faker.internet.ipv4(), detectedCountry: "BD",
    preferences: { ...DEFAULT_PREFERENCES, privacy: { ...DEFAULT_PREFERENCES.privacy, profileVisibility: "private" as const, showLastSeen: false, allowFriendRequests: false, allowDirectMessages: false, searchable: false } },
    addresses: [{ type: "work", street: "456 Super Admin Ave", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true }],
    loginCount: faker.number.int({ min: 100, max: 300 }), lastLoginAt: new Date(), accountCreatedAt: new Date(),
    metadata: { userAgent: faker.internet.userAgent(), initialCountry: "BD", signupFlow: "direct" },
    createdAt: new Date(), updatedAt: new Date(),
  };
}

async function createModeratorUser() {
  return {
    _id: new mongoose.Types.ObjectId(),
    username: "moderator_user",
    email: "moderator@example.com",
    password: await generateHashedPassword("moderator123"),
    firstName: "System", lastName: "Moderator", displayName: "System Moderator",
    avatar: { url: getUnsplashAvatar(), publicId: `avatar-moderator-${faker.string.uuid()}` },
    role: UserRole.MODERATOR,
    permissions: [Permission.USERS_VIEW, Permission.CONTENT_VIEW, Permission.CONTENT_CREATE, Permission.CONTENT_EDIT, Permission.TICKETS_VIEW, Permission.TICKETS_EDIT],
    status: UserStatus.ACTIVE, isVerified: true, emailVerified: true, isActive: true,
    phone: generateValidPhoneNumber(), phoneVerified: true, gender: Gender.FEMALE,
    dateOfBirth: new Date("1990-01-01"), userLanguage: "en", timezone: "UTC",
    registrationIP: faker.internet.ipv4(), detectedCountry: "BD",
    preferences: { ...DEFAULT_PREFERENCES, notifications: { ...DEFAULT_PREFERENCES.notifications, sms: true } },
    addresses: [{ type: "work", street: "789 Mod Plaza", city: "Dhaka", state: "Dhaka", country: "Bangladesh", zipCode: "1200", isDefault: true }],
    loginCount: faker.number.int({ min: 20, max: 100 }), lastLoginAt: new Date(), accountCreatedAt: new Date(),
    metadata: { userAgent: faker.internet.userAgent(), initialCountry: "BD", signupFlow: "direct" },
    createdAt: new Date(), updatedAt: new Date(),
  };
}

function createRegularUser(usedUsernames: Set<string>, usedEmails: Set<string>) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  let username: string;
  let attempts = 0;
  do {
    username = generateValidUsername();
    attempts++;
    if (attempts > 5) username = `user_${firstName.toLowerCase()}_${faker.string.numeric(4)}`;
  } while (usedUsernames.has(username) && attempts < 10);
  usedUsernames.add(username);

  let email: string;
  attempts = 0;
  do {
    email = faker.internet.email({ firstName, lastName }).toLowerCase();
    attempts++;
    if (attempts > 5) email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${faker.string.numeric(3)}@example.com`;
  } while (usedEmails.has(email) && attempts < 10);
  usedEmails.add(email);

  return {
    _id: new mongoose.Types.ObjectId(),
    username, email,
    password: "password123", // Will be hashed later
    firstName, lastName, displayName: `${firstName} ${lastName}`,
    avatar: { url: getUnsplashAvatar(), publicId: `avatar-${faker.string.uuid()}` },
    role: faker.helpers.arrayElement([UserRole.USER, UserRole.PREMIUM]),
    permissions: [], status: UserStatus.ACTIVE,
    isVerified: faker.datatype.boolean(0.8), emailVerified: faker.datatype.boolean(0.8), isActive: true,
    phone: generateValidPhoneNumber(), phoneVerified: faker.datatype.boolean(0.6),
    gender: faker.helpers.arrayElement(Object.values(Gender)),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 70, mode: "age" }),
    bio: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
    userLanguage: faker.helpers.arrayElement(["en", "bn", "hi", "ur"]),
    timezone: faker.helpers.arrayElement(["UTC", "America/New_York", "Europe/London", "Asia/Dhaka"]),
    registrationIP: faker.internet.ipv4(), detectedCountry: faker.location.countryCode("alpha-2"),
    preferences: {
      notifications: { email: faker.datatype.boolean(0.8), sms: faker.datatype.boolean(0.3), push: faker.datatype.boolean(0.7), marketing: faker.datatype.boolean(0.2), security: faker.datatype.boolean(0.9), social: faker.datatype.boolean(0.6), system: faker.datatype.boolean(0.5) },
      privacy: { profileVisibility: faker.helpers.arrayElement(["public", "friends", "private"]), showEmail: false, showPhone: false, showOnlineStatus: faker.datatype.boolean(0.7), showLastSeen: faker.datatype.boolean(0.6), allowFriendRequests: faker.datatype.boolean(0.8), allowDirectMessages: faker.datatype.boolean(0.7), searchable: faker.datatype.boolean(0.9) },
      security: { requireTwoFactorForPasswordChange: faker.datatype.boolean(0.3), requireTwoFactorForEmailChange: faker.datatype.boolean(0.2), sessionTimeout: faker.helpers.arrayElement([30, 60, 120, 180]), allowMultipleSessions: faker.datatype.boolean(0.8), suspiciousActivityAlerts: faker.datatype.boolean(0.7) },
      language: faker.helpers.arrayElement(["en", "bn", "hi", "ur"]),
      currency: faker.helpers.arrayElement(["USD", "EUR", "GBP", "BDT"]),
      timezone: faker.helpers.arrayElement(["UTC", "America/New_York", "Europe/London", "Asia/Dhaka"]),
      dateFormat: "YYYY-MM-DD", timeFormat: faker.helpers.arrayElement(["12", "24"]),
    },
    addresses: [{ type: faker.helpers.arrayElement(["home", "work", "billing"]), street: faker.location.streetAddress(), city: faker.location.city(), state: faker.location.state(), country: faker.location.country(), zipCode: faker.location.zipCode(), isDefault: true }],
    loginCount: faker.number.int({ min: 0, max: 50 }), lastLoginAt: faker.date.recent(), accountCreatedAt: faker.date.past({ years: 2 }),
    metadata: { userAgent: faker.internet.userAgent(), initialCountry: faker.location.countryCode("alpha-2"), signupFlow: faker.helpers.arrayElement(["direct", "social", "invite"]) },
    createdAt: faker.date.past({ years: 2 }), updatedAt: faker.date.recent(),
  };
}

export async function generateMockUsers() {
  const users: any[] = [];
  const usedUsernames = new Set<string>();
  const usedEmails = new Set<string>();

  const admin = await createAdminUser();
  const superAdmin = await createSuperAdminUser();
  const moderator = await createModeratorUser();

  users.push(admin, superAdmin, moderator);
  usedUsernames.add("admin_user");
  usedUsernames.add("super_admin");
  usedUsernames.add("moderator_user");
  usedEmails.add("admin@example.com");
  usedEmails.add("superadmin@example.com");
  usedEmails.add("moderator@example.com");

  const NUM_USERS = 50;
  for (let i = 0; i < NUM_USERS - 3; i++) {
    const userData = createRegularUser(usedUsernames, usedEmails);
    userData.password = await generateHashedPassword("password123");
    users.push(userData);
  }

  return users;
}
