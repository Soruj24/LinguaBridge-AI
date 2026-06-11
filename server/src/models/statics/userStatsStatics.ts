import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserStatus, UserRole } from "../interfaces/IUser";

export const applyUserStatsStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getUserStats = function (dateRange?: { start: Date; end: Date }) {
    const matchStage: any = { isDeleted: { $ne: true } };

    if (dateRange) {
      matchStage.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }

    return this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', UserStatus.ACTIVE] }, 1, 0] } },
          onlineUsers: { $sum: { $cond: ['$isOnline', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          bannedUsers: { $sum: { $cond: ['$isBanned', 1, 0] } },
          premiumUsers: { $sum: { $cond: [{ $eq: ['$role', UserRole.PREMIUM] }, 1, 0] } },
          avgProfileCompletion: { $avg: '$profileCompletion' },
          avgLoginCount: { $avg: '$loginCount' }
        }
      },
      {
        $addFields: {
          activePercentage: { $multiply: [{ $divide: ['$activeUsers', '$totalUsers'] }, 100] },
          verificationRate: { $multiply: [{ $divide: ['$verifiedUsers', '$totalUsers'] }, 100] }
        }
      }
    ]);
  };
};
