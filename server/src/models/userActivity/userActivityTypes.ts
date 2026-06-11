import mongoose, { Document, Model } from 'mongoose';

export interface IUserActivity extends Document {
    userId: mongoose.Types.ObjectId;
    activityType: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    location?: { country?: string; city?: string; region?: string; timezone?: string; };
    deviceInfo?: { browser?: string; os?: string; device?: string; platform?: string; };
    timestamp: Date;
    metadata?: any;
    status: 'success' | 'failure' | 'warning' | 'info';
    duration?: number;
    resourceId?: mongoose.Types.ObjectId;
    resourceType?: string;
}

export interface IUserActivityModel extends Model<IUserActivity> {
    getUserActivities(
        userId: mongoose.Types.ObjectId,
        page?: number,
        limit?: number,
        filters?: any
    ): Promise<{
        activities: IUserActivity[];
        pagination: { currentPage: number; totalPages: number; totalActivities: number; hasNextPage: boolean; hasPrevPage: boolean; };
    }>;
    getActivityStats(userId: mongoose.Types.ObjectId, days?: number): Promise<any[]>;
    logActivity(activityData: {
        userId: mongoose.Types.ObjectId;
        activityType: string;
        description: string;
        ipAddress?: string;
        userAgent?: string;
        location?: any;
        deviceInfo?: any;
        status?: 'success' | 'failure' | 'warning' | 'info';
        duration?: number;
        resourceId?: mongoose.Types.ObjectId;
        resourceType?: string;
        metadata?: any;
    }): Promise<IUserActivity>;
}
