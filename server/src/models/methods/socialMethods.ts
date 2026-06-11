import { Schema, Types } from "mongoose";
import { IUserDoc } from "../types/UserTypes";
import { ProfileVisibility } from "../interfaces/IUser";

export const applySocialMethods = (schema: Schema<IUserDoc>) => {
  schema.methods.isFollowing = function (userId: Types.ObjectId): boolean {
    return this.following ? this.following.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };

  schema.methods.isBlocked = function (userId: Types.ObjectId): boolean {
    return this.blockedUsers ? this.blockedUsers.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };

  schema.methods.isFriend = function (userId: Types.ObjectId): boolean {
    return this.friends ? this.friends.some((id: Types.ObjectId) => id.equals(userId)) : false;
  };

  schema.methods.canViewProfile = function (viewerId: Types.ObjectId): boolean {
    if (this.isBlocked(viewerId)) return false;

    const privacy = this.preferences?.privacy;
    if (!privacy) return true;

    switch (privacy.profileVisibility) {
      case ProfileVisibility.PUBLIC:
        return true;
      case ProfileVisibility.FRIENDS:
        return this.isFriend(viewerId);
      case ProfileVisibility.PRIVATE:
        return this._id.equals(viewerId);
      default:
        return true;
    }
  };

  schema.methods.sendFriendRequest = async function (targetUserId: Types.ObjectId): Promise<boolean> {
    if (this.isBlocked(targetUserId) || this.isFriend(targetUserId)) {
      return false;
    }

    const targetUser = await (this.constructor as any).findById(targetUserId);
    if (!targetUser || !targetUser.preferences?.privacy?.allowFriendRequests) {
      return false;
    }

    if (!this.friendRequests) this.friendRequests = { sent: [], received: [] };
    if (!this.friendRequests.sent.some((id: Types.ObjectId) => id.equals(targetUserId))) {
      this.friendRequests.sent.push(targetUserId);
    }

    if (!targetUser.friendRequests) targetUser.friendRequests = { sent: [], received: [] };
    if (!targetUser.friendRequests.received.some((id: Types.ObjectId) => id.equals(this._id))) {
      targetUser.friendRequests.received.push(this._id);
    }

    await Promise.all([this.save(), targetUser.save()]);

    await this.addAuditLog('FRIEND_REQUEST_SENT', { targetUserId });
    return true;
  };

  schema.methods.acceptFriendRequest = async function (fromUserId: Types.ObjectId): Promise<boolean> {
    if (!this.friendRequests?.received.some((id: Types.ObjectId) => id.equals(fromUserId))) {
      return false;
    }

    const fromUser = await (this.constructor as any).findById(fromUserId);
    if (!fromUser) return false;

    if (!this.friends.some((id: Types.ObjectId) => id.equals(fromUserId))) {
      this.friends.push(fromUserId);
    }
    if (!fromUser.friends.some((id: Types.ObjectId) => id.equals(this._id))) {
      fromUser.friends.push(this._id);
    }

    this.friendRequests.received = this.friendRequests.received.filter((id: Types.ObjectId) => !id.equals(fromUserId));
    fromUser.friendRequests.sent = fromUser.friendRequests.sent.filter((id: Types.ObjectId) => !id.equals(this._id));

    await Promise.all([this.save(), fromUser.save()]);

    await this.addAuditLog('FRIEND_REQUEST_ACCEPTED', { fromUserId });
    return true;
  };

  schema.methods.blockUser = async function (userIdToBlock: Types.ObjectId): Promise<boolean> {
    if (this.isBlocked(userIdToBlock)) return false;

    this.blockedUsers.push(userIdToBlock);

    this.friends = this.friends.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));
    this.following = this.following.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));
    this.followers = this.followers.filter((id: Types.ObjectId) => !id.equals(userIdToBlock));

    await this.addAuditLog('USER_BLOCKED', { blockedUserId: userIdToBlock });
    return this.save().then(() => true);
  };

  schema.methods.unblockUser = async function (userIdToUnblock: Types.ObjectId): Promise<boolean> {
    if (!this.isBlocked(userIdToUnblock)) return false;

    this.blockedUsers = this.blockedUsers.filter((id: Types.ObjectId) => !id.equals(userIdToUnblock));

    await this.addAuditLog('USER_UNBLOCKED', { unblockedUserId: userIdToUnblock });
    return this.save().then(() => true);
  };
};
