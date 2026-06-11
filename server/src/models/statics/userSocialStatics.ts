import { Schema } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserStatus } from "../interfaces/IUser";

export const applyUserSocialStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.getActiveUsers = function (options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
  } = {}) {
    const { limit = 50, skip = 0, sortBy = '-lastSeen' } = options;

    return this.find({
      status: UserStatus.ACTIVE,
      isBanned: false,
      isDeleted: { $ne: true },
      isOnline: true
    })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .select('username email firstName lastName displayName avatar isOnline lastSeen role')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
  };

  schema.statics.getTopUsers = function (
    metric: 'followers' | 'connections' | 'activity',
    limit: number = 10
  ) {
    let sortField: any;

    switch (metric) {
      case 'followers':
        sortField = { followersCount: -1 };
        break;
      case 'connections':
        sortField = { totalConnections: -1 };
        break;
      case 'activity':
        sortField = { loginCount: -1, lastLoginAt: -1 };
        break;
      default:
        sortField = { createdAt: -1 };
    }

    return this.aggregate([
      {
        $match: {
          status: UserStatus.ACTIVE,
          isBanned: false,
          isDeleted: { $ne: true }
        }
      },
      {
        $addFields: {
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } },
          friendsCount: { $size: { $ifNull: ['$friends', []] } },
          totalConnections: {
            $add: [
              { $size: { $ifNull: ['$followers', []] } },
              { $size: { $ifNull: ['$following', []] } },
              { $size: { $ifNull: ['$friends', []] } }
            ]
          }
        }
      },
      { $sort: sortField },
      { $limit: limit },
      {
        $project: {
          username: 1,
          displayName: 1,
          avatar: 1,
          isVerified: 1,
          role: 1,
          followersCount: 1,
          totalConnections: 1,
          loginCount: 1,
          lastLoginAt: 1
        }
      }
    ]);
  };
};
