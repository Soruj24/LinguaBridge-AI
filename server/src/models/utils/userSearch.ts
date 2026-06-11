import { UserStatus } from "../interfaces/IUser";
import User from "../schemas/User";

export async function advancedUserSearch(filters: {
    query?: string;
    status?: UserStatus;
    role?: string;
    isVerified?: boolean;
    isOnline?: boolean;
    country?: string;
    language?: string;
    dateRange?: { start: Date; end: Date };
    limit?: number;
    skip?: number;
    sortBy?: string;
}) {
    const {
        query, status, role, isVerified, isOnline, country, language, dateRange,
        limit = 20, skip = 0, sortBy = '-createdAt'
    } = filters;

    const searchFilter: any = {
        isDeleted: { $ne: true },
        isBanned: false
    };

    if (query) {
        searchFilter.$or = [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { displayName: { $regex: query, $options: 'i' } }
        ];
    }

    if (status) searchFilter.status = status;
    if (role) searchFilter.role = role;
    if (isVerified !== undefined) searchFilter.isVerified = isVerified;
    if (isOnline !== undefined) searchFilter.isOnline = isOnline;
    if (country) searchFilter.detectedCountry = country.toUpperCase();
    if (language) searchFilter['preferences.language'] = language;
    if (dateRange) {
        searchFilter.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }

    const users = await User.find(searchFilter)
        .limit(limit)
        .skip(skip)
        .sort(sortBy)
        .select('username email firstName lastName displayName avatar isOnline lastSeen role isVerified detectedCountry preferences.language createdAt');

    const total = await User.countDocuments(searchFilter);

    return {
        users,
        pagination: { total, limit, skip, hasMore: skip + users.length < total }
    };
}
