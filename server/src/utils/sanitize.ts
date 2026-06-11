import { IUser } from "../types";

export const sanitizeUser = (user: IUser): Partial<IUser> => {
  const userObject = (user as any).toObject
    ? (user as any).toObject()
    : { ...user };
  delete (userObject as any).password;

  if (userObject.twoFactorAuth?.secret) {
    delete userObject.twoFactorAuth.secret;
  }

  return userObject;
};
