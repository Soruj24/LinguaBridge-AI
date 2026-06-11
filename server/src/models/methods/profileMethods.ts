import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { calculateAge } from "../utils/UserUtils";

export const applyProfileMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.getAge = function (): number | null {
    if (!this.dateOfBirth) return null;
    return calculateAge(this.dateOfBirth);
  };

  schema.methods.getFullName = function (): string {
    return this.fullName;
  };

  schema.methods.getDisplayName = function (): string {
    return this.displayNameOrUsername;
  };

  schema.methods.isProfileComplete = function (): boolean {
    return this.profileCompletion >= 60;
  };

  schema.methods.updateProfile = async function (updates: any): Promise<IUserDoc> {
    const allowedUpdates = [
      'firstName', 'lastName', 'displayName', 'bio', 'website', 'dateOfBirth',
      'gender', 'phone', 'socialLinks', 'preferences'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        (this as any)[key] = updates[key];
      }
    });

    await this.addAuditLog('PROFILE_UPDATED', { updatedFields: Object.keys(updates) });
    return this.save();
  };
};
