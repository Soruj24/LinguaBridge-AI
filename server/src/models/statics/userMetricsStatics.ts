import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserStatus, UserRole } from "../interfaces/IUser";

export const applyUserMetricsStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getEngagementMetrics = function () {
    return this.aggregate([
      {
        $match: {
          status: UserStatus.ACTIVE,
          isDeleted: { $ne: true }
        }
      },
      {
        $addFields: {
          daysSinceLastLogin: {
            $divide: [
              { $subtract: [new Date(), '$lastSeen'] },
              1000 * 60 * 60 * 24
            ]
          },
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } },
          friendsCount: { $size: { $ifNull: ['$friends', []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalActiveUsers: { $sum: 1 },
          dailyActiveUsers: {
            $sum: {
              $cond: [{ $lte: ['$daysSinceLastLogin', 1] }, 1, 0]
            }
          },
          weeklyActiveUsers: {
            $sum: {
              $cond: [{ $lte: ['$daysSinceLastLogin', 7] }, 1, 0]
            }
          },
          monthlyActiveUsers: {
            $sum: {
              $cond: [{ $lte: ['$daysSinceLastLogin', 30] }, 1, 0]
            }
          },
          avgFollowers: { $avg: '$followersCount' },
          avgFollowing: { $avg: '$followingCount' },
          avgFriends: { $avg: '$friendsCount' },
          avgLoginCount: { $avg: '$loginCount' },
          highlyEngagedUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$followersCount', 10] },
                    { $gte: ['$loginCount', 20] },
                    { $lte: ['$daysSinceLastLogin', 7] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
  };

  schema.statics.getUserGrowthMetrics = function (days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: ['$emailVerified', 1, 0] }
          },
          premiumUsers: {
            $sum: { $cond: [{ $eq: ['$role', UserRole.PREMIUM] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          newUsers: 1,
          verifiedUsers: 1,
          premiumUsers: 1,
          verificationRate: {
            $multiply: [
              { $divide: ['$verifiedUsers', '$newUsers'] },
              100
            ]
          }
        }
      }
    ]);
  };
};
