import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { applyUserSearchStatics } from "./userSearchStatics";
import { applyUserStatsStatics } from "./userStatsStatics";
import { applyUserMetricsStatics } from "./userMetricsStatics";
import { applyUserManagementStatics } from "./userManagementStatics";
import { applyUserAdminStatics } from "./userAdminStatics";
import { applyUserSocialStatics } from "./userSocialStatics";

export const applyUserStatics = (schema: Schema<IUserDoc>) => {
  applyUserSearchStatics(schema);
  applyUserStatsStatics(schema);
  applyUserMetricsStatics(schema);
  applyUserManagementStatics(schema);
  applyUserAdminStatics(schema);
  applyUserSocialStatics(schema);
};
