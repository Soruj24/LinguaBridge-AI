import { Schema } from 'mongoose';
import { INotification } from './notificationTypes';

export function applyNotificationStatics(schema: Schema<INotification>) {
    schema.statics.getUserNotifications = async function (
        userId: any,
        page: number = 1,
        limit: number = 20,
        filters: any = {}
    ) {
        const skip = (page - 1) * limit;
        const query = {
            userId,
            ...filters,
            $and: [
                { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] },
                { $or: [{ scheduledFor: { $exists: false } }, { scheduledFor: { $lte: new Date() } }] }
            ]
        };
        const notifications = await this.find(query)
            .sort({ sentAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'firstName lastName avatar')
            .lean();
        const total = await this.countDocuments(query);
        const unreadCount = await this.countDocuments({ ...query, read: false });
        return {
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalNotifications: total,
                unreadCount,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    };

    schema.statics.markAsRead = async function (
        notificationIds: any[],
        userId?: any
    ) {
        const updateData: any = { read: true, readAt: new Date() };
        const query: any = { _id: { $in: notificationIds } };
        if (userId) query.userId = userId;
        return await this.updateMany(query, updateData);
    };

    schema.statics.markAllAsRead = async function (userId: any) {
        return await this.updateMany(
            { userId, read: false },
            { read: true, readAt: new Date() }
        );
    };

    schema.statics.createMultiple = async function (
        notificationsData: Array<{
            userId: any;
            title: string;
            message: string;
            type?: string;
            priority?: string;
            category: string;
            actionUrl?: string;
            actionLabel?: string;
            icon?: string;
            imageUrl?: string;
            metadata?: any;
            expiresAt?: Date;
            scheduledFor?: Date;
            createdBy?: any;
            tags?: string[];
        }>
    ) {
        return await this.insertMany(notificationsData);
    };
}
