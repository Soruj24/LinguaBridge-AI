import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    read: boolean;
    readAt?: Date;
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    imageUrl?: string;
    metadata?: any;
    expiresAt?: Date;
    scheduledFor?: Date;
    sentAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    tags: string[];
}
