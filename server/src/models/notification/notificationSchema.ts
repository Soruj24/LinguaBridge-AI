import { Schema } from 'mongoose';
import { INotification } from './notificationTypes';

export const NotificationSchema: Schema<INotification> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'], index: true },
    title: { type: String, required: [true, 'Notification title is required'], trim: true, maxlength: [200, 'Title cannot exceed 200 characters'] },
    message: { type: String, required: [true, 'Notification message is required'], trim: true, maxlength: [1000, 'Message cannot exceed 1000 characters'] },
    type: { type: String, enum: ['info', 'warning', 'error', 'success', 'system'], default: 'info', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    category: { type: String, required: [true, 'Notification category is required'], enum: ['security', 'account', 'billing', 'system', 'marketing', 'social', 'order', 'shipping', 'support', 'update', 'alert'], index: true },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    actionUrl: { type: String, trim: true, validate: { validator: function (url: string) { if (!url) return true; return /^\/|^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url); }, message: 'Invalid URL format' } },
    actionLabel: { type: String, trim: true, maxlength: [50, 'Action label cannot exceed 50 characters'] },
    icon: { type: String, trim: true },
    imageUrl: { type: String, trim: true, validate: { validator: function (url: string) { if (!url) return true; return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url); }, message: 'Invalid image URL format' } },
    metadata: { type: Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, index: true, validate: { validator: function (date: Date) { if (!date) return true; return date > new Date(); }, message: 'Expiration date must be in the future' } },
    scheduledFor: { type: Date, index: true, validate: { validator: function (date: Date) { if (!date) return true; return date > new Date(); }, message: 'Scheduled date must be in the future' } },
    sentAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, trim: true, lowercase: true }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

NotificationSchema.index({ userId: 1, read: 1, sentAt: -1 });
NotificationSchema.index({ category: 1, sentAt: -1 });
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ scheduledFor: 1 });

NotificationSchema.virtual('status').get(function (this: INotification) {
    if (this.read) return 'read';
    if (this.expiresAt && this.expiresAt < new Date()) return 'expired';
    if (this.scheduledFor && this.scheduledFor > new Date()) return 'scheduled';
    return 'unread';
});

NotificationSchema.virtual('isExpired').get(function (this: INotification) {
    return this.expiresAt && this.expiresAt < new Date();
});

NotificationSchema.virtual('isScheduled').get(function (this: INotification) {
    return this.scheduledFor && this.scheduledFor > new Date();
});

NotificationSchema.pre('save', function (this: INotification, next) {
    if (!this.scheduledFor || this.scheduledFor <= new Date()) {
        this.sentAt = new Date();
    }
    next();
});
