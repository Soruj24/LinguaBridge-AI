import { Types } from "mongoose";
import User from "../schemas/User";

export async function getUserDashboard(userId: Types.ObjectId): Promise<any> {
    const user = await User.findById(userId)
        .populate('friends', 'username displayName avatar isOnline lastSeen')
        .populate('followers', 'username displayName avatar isOnline')
        .populate('following', 'username displayName avatar isOnline');

    if (!user) {
        throw new Error('User not found');
    }

    return {
        profile: user.toSafeJSON(),
        stats: {
            profileCompletion: user.profileCompletion,
            totalConnections: user.totalConnections,
            accountAge: user.accountAgeInDays,
            loginCount: user.loginCount,
            lastLoginAt: user.lastLoginAt
        },
        connections: {
            friends: user.friends,
            followers: user.followers,
            following: user.following,
            pendingRequests: user.friendRequests?.received.length || 0
        },
        recentActivity: user.loginHistory?.slice(0, 5) || []
    };
}
