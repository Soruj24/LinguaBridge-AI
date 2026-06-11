import { Schema, Types } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { UserStatus } from "../interfaces/IUser";

export const applyUserManagementStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.bulkUpdateStatus = function (userIds: Types.ObjectId[], status: UserStatus) {
    return this.updateMany(
      { _id: { $in: userIds }, isDeleted: { $ne: true } },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );
  };

  schema.statics.cleanupInactiveUsers = function (daysInactive: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    return this.updateMany(
      {
        lastSeen: { $lt: cutoffDate },
        status: { $in: [UserStatus.INACTIVE, UserStatus.PENDING] },
        isDeleted: { $ne: true }
      },
      {
        $set: {
          isDeleted: true,
          status: UserStatus.DELETED,
          updatedAt: new Date()
        }
      }
    ).then((result: any) => result.modifiedCount);
  };

  schema.statics.findSuspiciousLogins = function (timeWindow: number = 24) {
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - timeWindow);

    return this.aggregate([
      { $unwind: '$loginHistory' },
      {
        $match: {
          'loginHistory.timestamp': { $gte: timeThreshold },
          'loginHistory.success': false
        }
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          email: { $first: '$email' },
          failedAttempts: { $sum: 1 },
          distinctIPs: { $addToSet: '$loginHistory.ipAddress' },
          lastFailure: { $max: '$loginHistory.timestamp' }
        }
      },
      {
        $match: {
          $or: [
            { failedAttempts: { $gte: 5 } },
            { distinctIPs: { $size: { $gte: 3 } } }
          ]
        }
      },
      {
        $sort: { failedAttempts: -1, lastFailure: -1 }
      }
    ]);
  };

  schema.statics.findDormantUsers = function (daysInactive: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    return this.find({
      lastSeen: { $lt: cutoffDate },
      status: UserStatus.ACTIVE,
      isDeleted: { $ne: true },
      isBanned: false
    })
      .select('username email firstName lastName lastSeen loginCount accountCreatedAt')
      .sort({ lastSeen: 1 })
      .limit(100);
  };

  schema.statics.findUsersWithExpiredTokens = function () {
    const now = new Date();
    return this.find({
      $or: [
        { resetPasswordExpires: { $lt: now } },
        { emailVerificationExpires: { $lt: now } },
        { phoneVerificationExpires: { $lt: now } }
      ],
      isDeleted: { $ne: true }
    }).select('username email resetPasswordExpires emailVerificationExpires phoneVerificationExpires');
  };
};
