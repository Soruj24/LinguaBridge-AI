import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";

export const applyAuditMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.addAuditLog = async function (
    action: string,
    details: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    if (!this.auditLog) this.auditLog = [];

    this.auditLog.unshift({
      action,
      details,
      ipAddress,
      userAgent: details.userAgent,
      timestamp: new Date()
    });

    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(0, 100);
    }
  };

  schema.methods.toSafeJSON = function (): Record<string, any> {
    const obj = this.toJSON();

    delete obj.auditLog;
    delete obj.sessions;
    if (obj.metadata) {
      delete obj.metadata.deviceFingerprint;
    }

    return obj;
  };
};
