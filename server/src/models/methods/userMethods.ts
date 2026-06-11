import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { applyAuthMethods } from "./authMethods";
import { applySecurityMethods } from "./securityMethods";
import { applyProfileMethods } from "./profileMethods";
import { applySocialMethods } from "./socialMethods";
import { applySessionMethods } from "./sessionMethods";
import { applyAuditMethods } from "./auditMethods";
import { applyPermissionMethods } from "./permissionMethods";
import { applySubscriptionMethods } from "./subscriptionMethods";

export const applyUserMethods = (schema: Schema<IUserDoc>) => {
  applyAuthMethods(schema);
  applySecurityMethods(schema);
  applyProfileMethods(schema);
  applySocialMethods(schema);
  applySessionMethods(schema);
  applyAuditMethods(schema);
  applyPermissionMethods(schema);
  applySubscriptionMethods(schema);
};
