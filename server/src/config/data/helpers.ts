import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "root",
  "system",
  "null",
  "undefined",
  "api",
  "www",
  "support",
  "help",
  "contact",
  "test",
  "moderator",
  "guest",
  "anonymous",
  "user",
  "users",
  "settings",
  "config",
];

export const getUnsplashAvatar = (): string => {
  return `https://images.unsplash.com/photo-${faker.helpers.arrayElement([
    "1472099645785-5658abf4ff4e",
    "1494790108755-2616c60b6635",
    "1507003211169-0a1dd7228f2d",
    "1517841905240-472988babdf9",
    "1573496359142-b8d87734a5a2",
    "1560250097-0b93528c311a",
  ])}?w=150&h=150&fit=crop&crop=face`;
};

export const generateValidPhoneNumber = (): string => {
  const bangladeshNumbers = [
    "+8801312345678",
    "+8801412345678",
    "+8801512345678",
    "+8801612345678",
    "+8801712345678",
    "+8801812345678",
    "+8801912345678",
    "+8801321234567",
    "+8801421234567",
    "+8801521234567",
    "+8801621234567",
    "+8801721234567",
    "+8801821234567",
    "+8801921234567",
  ];
  return faker.helpers.arrayElement(bangladeshNumbers);
};

export const generateValidUsername = (): string => {
  let username: string;
  let attempts = 0;
  do {
    username = faker.internet
      .username()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .substring(0, 30);
    if (RESERVED_USERNAMES.includes(username)) {
      username = username + faker.string.numeric(2);
    }
    attempts++;
    if (attempts > 10) {
      username = `user_${faker.string.alphanumeric(8)}`;
      break;
    }
  } while (RESERVED_USERNAMES.includes(username));
  return username;
};

export const generateHashedPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
