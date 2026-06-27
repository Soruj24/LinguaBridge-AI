import { IUser } from "../types";
import { AUTH_CONSTANTS } from "../constants";
import createError from "http-errors";
import User from "../models/schemas/User";

export const validateUserStatus = (user: IUser): void => {
  if (user.isBanned) {
    throw createError(
      403,
      "Your account has been suspended. Please contact support."
    );
  }

  if ((user as any).status !== "active") {
    throw createError(
      403,
      "Your account is not active. Please contact support."
    );
  }
};

export const trackFailedLoginAttempt = async (user: IUser): Promise<void> => {
  const loginAttempts = ((user as any).loginAttempts || 0) + 1;
  const lockoutUntil =
    loginAttempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + AUTH_CONSTANTS.LOCKOUT_TIME)
      : null;

  await User.findByIdAndUpdate(user._id, {
    loginAttempts,
    lockoutUntil: lockoutUntil || undefined,
  });
};

export const resetLoginAttempts = async (user: IUser): Promise<void> => {
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    $unset: { lockoutUntil: 1 },
  });
};

export const checkAccountLockout = (user: IUser): void => {
  if (
    (user as any).lockoutUntil &&
    new Date((user as any).lockoutUntil) > new Date()
  ) {
    const timeLeft = Math.ceil(
      (new Date((user as any).lockoutUntil).getTime() - Date.now()) / 60000
    );
    throw createError(
      423,
      `Account temporarily locked. Try again in ${timeLeft} minutes.`
    );
  }
};
