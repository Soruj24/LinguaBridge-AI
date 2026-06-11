import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { generateSecureToken, sanitizeUserAgent } from "../utils/UserUtils";

export const applySessionMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.createSession = async function (deviceInfo: string, ipAddress: string): Promise<string> {
    const sessionId = generateSecureToken();

    if (!this.sessions) this.sessions = [];

    this.sessions.push({
      sessionId,
      deviceInfo: sanitizeUserAgent(deviceInfo),
      ipAddress,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    });

    await this.save();
    return sessionId;
  };

  schema.methods.invalidateSession = async function (sessionId: string): Promise<boolean> {
    if (!this.sessions) return false;

    const session = this.sessions.find((s: any) => s.sessionId === sessionId);
    if (session) {
      session.isActive = false;
      await this.save();
      return true;
    }
    return false;
  };

  schema.methods.invalidateAllSessions = async function (): Promise<boolean> {
    if (this.sessions) {
      this.sessions.forEach((session: any) => {
        session.isActive = false;
      });
      await this.save();
    }
    return true;
  };
};
