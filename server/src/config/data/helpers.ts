import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { RESERVED_USERNAMES, BANGLADESH_PHONE_NUMBERS, UNSPLASH_AVATARS } from "./constants";

export const getUnsplashAvatar = (): string => {
  return `https://images.unsplash.com/photo-${faker.helpers.arrayElement(UNSPLASH_AVATARS)}?w=150&h=150&fit=crop&crop=face`;
};

export const generateValidPhoneNumber = (): string => {
  return faker.helpers.arrayElement(BANGLADESH_PHONE_NUMBERS);
};

export const generateValidUsername = (): string => {
  let username: string;
  let attempts = 0;

  do {
    username = faker.internet.username().toLowerCase().replace(/[^a-z0-9._-]/g, "").substring(0, 30);
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
