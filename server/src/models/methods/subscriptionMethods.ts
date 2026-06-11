import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserRole } from "../interfaces/IUser";

export const applySubscriptionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.hasActiveSubscription = function (): boolean {
    return !!(this.subscription &&
      this.subscription.status === 'active' &&
      (!this.subscription.expiresAt || this.subscription.expiresAt > new Date()));
  };

  schema.methods.hasFeature = function (feature: string): boolean {
    if (this.role === UserRole.PREMIUM || this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    return !!(this.subscription &&
      this.subscription.features &&
      this.subscription.features.includes(feature));
  };
};
