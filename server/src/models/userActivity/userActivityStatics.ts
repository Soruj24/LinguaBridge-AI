import { Schema } from 'mongoose';
import { IUserActivity } from './userActivityTypes';

export function applyUserActivityStatics(schema: Schema<IUserActivity>) {
    schema.statics.getUserActivities = async function (
        userId: any,
        page: number = 1,
        limit: number = 10,
        filters: any = {}
    ) {
        const skip = (page - 1) * limit;
        const query = { userId, ...filters };
        const activities = await this.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .lean();
        const total = await this.countDocuments(query);
        return {
            activities,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalActivities: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    };

    schema.statics.getActivityStats = async function (
        userId: any,
        days: number = 30
    ) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const stats = await this.aggregate([
            { $match: { userId: userId, timestamp: { $gte: startDate } } },
            { $group: { _id: { activityType: '$activityType', status: '$status' }, count: { $sum: 1 }, lastActivity: { $max: '$timestamp' } } },
            { $group: { _id: '$_id.activityType', total: { $sum: '$count' }, success: { $sum: { $cond: [{ $eq: ['$_id.status', 'success'] }, '$count', 0] } }, failure: { $sum: { $cond: [{ $eq: ['$_id.status', 'failure'] }, '$count', 0] } }, warning: { $sum: { $cond: [{ $eq: ['$_id.status', 'warning'] }, '$count', 0] } }, info: { $sum: { $cond: [{ $eq: ['$_id.status', 'info'] }, '$count', 0] } }, lastActivity: { $max: '$lastActivity' } } },
            { $project: { activityType: '$_id', total: 1, success: 1, failure: 1, warning: 1, info: 1, successRate: { $round: [{ $multiply: [{ $divide: ['$success', '$total'] }, 100] }, 2] }, lastActivity: 1 } },
            { $sort: { total: -1 } }
        ]);
        return stats;
    };

    schema.statics.logActivity = async function (activityData: {
        userId: any;
        activityType: string;
        description: string;
        ipAddress?: string;
        userAgent?: string;
        location?: any;
        deviceInfo?: any;
        status?: 'success' | 'failure' | 'warning' | 'info';
        duration?: number;
        resourceId?: any;
        resourceType?: string;
        metadata?: any;
    }) {
        return await this.create(activityData);
    };
}
