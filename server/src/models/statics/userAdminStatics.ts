import { Schema, Types } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { IUser, UserRole, UserStatus } from "../interfaces/IUser";

export const applyUserAdminStatics = (schema: Schema<IUserDoc>) => {
  schema.statics.createAdminUser = async function (
    userData: Partial<IUser>,
    createdBy: Types.ObjectId
  ): Promise<IUserDoc> {
    const creator = await this.findById(createdBy);
    if (!creator || creator.getRoleLevel() < 4) {
      throw new Error('Insufficient permissions to create admin user');
    }

    const adminData: Partial<IUser> = {
      ...userData,
      role: UserRole.ADMIN,
      isVerified: true,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      // @ts-expect-error twoFactorAuth is added dynamically
      twoFactorAuth: {
        enabled: true,
        method: 'totp',
        recoveryCodesUsed: 0
      }
    };

    const adminUser = new this(adminData);
    await (adminUser as IUserDoc).addAuditLog('ADMIN_USER_CREATED', {
      createdBy: createdBy,
      role: adminData.role
    });

    return adminUser.save();
  };

  schema.statics.getPasswordResetStats = function () {
    return this.aggregate([
      {
        $match: {
          resetPasswordExpires: { $exists: true },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          expiredTokens: {
            $sum: {
              $cond: [
                { $lt: ['$resetPasswordExpires', new Date()] },
                1,
                0
              ]
            }
          },
          validTokens: {
            $sum: {
              $cond: [
                { $gte: ['$resetPasswordExpires', new Date()] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
  };
};
