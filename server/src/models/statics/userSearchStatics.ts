import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserStatus } from "../interfaces/IUser";

export const applyUserSearchStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.searchUsers = function (
    query: string,
    options: {
      limit?: number;
      skip?: number;
      language?: string;
      fields?: string[];
      includeInactive?: boolean;
    } = {}
  ) {
    const {
      limit = 20,
      skip = 0,
      language = 'en',
      fields = ['username', 'email', 'firstName', 'lastName', 'displayName'],
      includeInactive = false
    } = options;

    const searchConditions = fields.map(field => ({
      [field]: { $regex: query, $options: 'i' }
    }));

    const baseFilter: any = {
      $or: searchConditions,
      isBanned: false,
      isDeleted: { $ne: true }
    };

    if (!includeInactive) {
      baseFilter.status = UserStatus.ACTIVE;
    }

    return this.find(baseFilter)
      .limit(limit)
      .skip(skip)
      .select('username email firstName lastName displayName avatar isOnline lastSeen role isVerified')
      .sort({ isOnline: -1, lastSeen: -1, isVerified: -1 });
  };

  schema.statics.findByEmail = function (email: string, includeDeleted: boolean = false) {
    const filter: any = { email: email.toLowerCase().trim() };
    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }
    return this.findOne(filter);
  };

  schema.statics.findByUsername = function (username: string, includeDeleted: boolean = false) {
    const filter: any = { username: username.toLowerCase().trim() };
    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }
    return this.findOne(filter);
  };

  schema.statics.findByPhone = function (phone: string, includeDeleted: boolean = false) {
    const filter: any = { phone };
    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }
    return this.findOne(filter);
  };
};
