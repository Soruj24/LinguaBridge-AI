import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Gender, UserRole, UserStatus } from "../../models/interfaces/IUser";
import { getUnsplashAvatar, generateValidPhoneNumber, generateValidUsername, generateHashedPassword } from "./helpers";

export const generateRegularUsers = async (
  usedUsernames: Set<string>,
  usedEmails: Set<string>,
  count: number
): Promise<any[]> => {
  const users: any[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    let username: string;
    let attempts = 0;
    do {
      username = generateValidUsername();
      attempts++;
      if (attempts > 5) {
        username = `user_${firstName.toLowerCase()}_${faker.string.numeric(4)}`;
      }
    } while (usedUsernames.has(username) && attempts < 10);
    usedUsernames.add(username);

    let email: string;
    attempts = 0;
    do {
      email = faker.internet.email({ firstName, lastName }).toLowerCase();
      attempts++;
      if (attempts > 5) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${faker.string.numeric(3)}@example.com`;
      }
    } while (usedEmails.has(email) && attempts < 10);
    usedEmails.add(email);

    users.push({
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password: await generateHashedPassword("password123"),
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      avatar: {
        url: getUnsplashAvatar(),
        publicId: `avatar-${faker.string.uuid()}`,
      },
      role: faker.helpers.arrayElement([UserRole.USER, UserRole.PREMIUM]),
      permissions: [],
      status: UserStatus.ACTIVE,
      isVerified: faker.datatype.boolean(0.8),
      emailVerified: faker.datatype.boolean(0.8),
      isActive: true,
      phone: generateValidPhoneNumber(),
      phoneVerified: faker.datatype.boolean(0.6),
      gender: faker.helpers.arrayElement(Object.values(Gender)),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 70, mode: "age" }),
      bio: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
      userLanguage: faker.helpers.arrayElement(["en", "bn", "hi", "ur"]),
      timezone: faker.helpers.arrayElement(["UTC", "America/New_York", "Europe/London", "Asia/Dhaka"]),
      registrationIP: faker.internet.ipv4(),
      detectedCountry: faker.location.countryCode("alpha-2"),
      preferences: {
        notifications: {
          email: faker.datatype.boolean(0.8),
          sms: faker.datatype.boolean(0.3),
          push: faker.datatype.boolean(0.7),
          marketing: faker.datatype.boolean(0.2),
          security: faker.datatype.boolean(0.9),
          social: faker.datatype.boolean(0.6),
          system: faker.datatype.boolean(0.5),
        },
        privacy: {
          profileVisibility: faker.helpers.arrayElement(["public", "friends", "private"]),
          showEmail: false,
          showPhone: false,
          showOnlineStatus: faker.datatype.boolean(0.7),
          showLastSeen: faker.datatype.boolean(0.6),
          allowFriendRequests: faker.datatype.boolean(0.8),
          allowDirectMessages: faker.datatype.boolean(0.7),
          searchable: faker.datatype.boolean(0.9),
        },
        security: {
          requireTwoFactorForPasswordChange: faker.datatype.boolean(0.3),
          requireTwoFactorForEmailChange: faker.datatype.boolean(0.2),
          sessionTimeout: faker.helpers.arrayElement([30, 60, 120, 180]),
          allowMultipleSessions: faker.datatype.boolean(0.8),
          suspiciousActivityAlerts: faker.datatype.boolean(0.7),
        },
        language: faker.helpers.arrayElement(["en", "bn", "hi", "ur"]),
        currency: faker.helpers.arrayElement(["USD", "EUR", "GBP", "BDT"]),
        timezone: faker.helpers.arrayElement(["UTC", "America/New_York", "Europe/London", "Asia/Dhaka"]),
        dateFormat: "YYYY-MM-DD",
        timeFormat: faker.helpers.arrayElement(["12", "24"]),
      },
      addresses: [
        {
          type: faker.helpers.arrayElement(["home", "work", "billing"]),
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          zipCode: faker.location.zipCode(),
          isDefault: true,
        },
      ],
      loginCount: faker.number.int({ min: 0, max: 50 }),
      lastLoginAt: faker.date.recent(),
      accountCreatedAt: faker.date.past({ years: 2 }),
      metadata: {
        userAgent: faker.internet.userAgent(),
        initialCountry: faker.location.countryCode("alpha-2"),
        signupFlow: faker.helpers.arrayElement(["direct", "social", "invite"]),
      },
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent(),
    });
  }

  return users;
};
