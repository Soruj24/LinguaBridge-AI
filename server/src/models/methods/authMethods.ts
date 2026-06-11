import { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDoc } from "../types/UserTypes";

export const applyAuthMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  schema.methods.updateLastSeen = async function (): Promise<IUserDoc> {
    this.lastSeen = new Date();
    this.isOnline = true;
    return this.save();
  };
};
