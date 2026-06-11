import { Schema } from 'mongoose';
import { IUserActivity } from './userActivityTypes';

export const UserActivitySchema: Schema<IUserActivity> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'], index: true },
    activityType: { type: String, required: [true, 'Activity type is required'], enum: ['login', 'logout', 'password_change', 'profile_update', 'email_verification', 'two_factor_setup', 'email_verified', 'info', 'status', 'admin_to_user_email', 'admin_email_sent', 'admin_email_received', 'password_reset_request', 'password_reset_success', 'account_deletion_request', 'preferences_update', 'avatar_upload', 'address_add', 'address_update', 'address_delete', 'admin_user_updated', 'admin_user_deleted', 'admin_user_created', 'session_created', 'session_ended', 'session_revoked', 'notification_read', 'email_verification_resent', 'export_data', 'api_call', 'email_sent', 'payment_made', 'subscription_update', 'role_change', 'account_creation', 'registration'], index: true },
    description: { type: String, required: [true, 'Activity description is required'], trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    location: { country: { type: String, trim: true }, city: { type: String, trim: true }, region: { type: String, trim: true }, timezone: { type: String, trim: true } },
    deviceInfo: { browser: { type: String, trim: true }, os: { type: String, trim: true }, device: { type: String, trim: true }, platform: { type: String, trim: true } },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['success', 'failure', 'warning', 'info'], default: 'success', index: true },
    duration: { type: Number, min: 0 },
    resourceId: { type: Schema.Types.ObjectId, refPath: 'resourceType' },
    resourceType: { type: String, enum: ['User', 'Session', 'Notification', 'Payment', 'Subscription'] }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
UserActivitySchema.index({ status: 1, timestamp: -1 });
UserActivitySchema.index({ 'location.country': 1, timestamp: -1 });

UserActivitySchema.virtual('formattedDate').get(function (this: IUserActivity) {
    return this.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
});

UserActivitySchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

UserActivitySchema.pre('save', function (next) {
    if (this.ipAddress) this.ipAddress = this.ipAddress.trim();
    if (this.userAgent) this.userAgent = this.userAgent.trim();
    if (this.location) {
        if (this.location.country) this.location.country = this.location.country.trim();
        if (this.location.city) this.location.city = this.location.city.trim();
        if (this.location.region) this.location.region = this.location.region.trim();
        if (this.location.timezone) this.location.timezone = this.location.timezone.trim();
    }
    if (this.deviceInfo) {
        if (this.deviceInfo.browser) this.deviceInfo.browser = this.deviceInfo.browser.trim();
        if (this.deviceInfo.os) this.deviceInfo.os = this.deviceInfo.os.trim();
        if (this.deviceInfo.device) this.deviceInfo.device = this.deviceInfo.device.trim();
        if (this.deviceInfo.platform) this.deviceInfo.platform = this.deviceInfo.platform.trim();
    }
    next();
});

UserActivitySchema.pre('save', function (next) {
    if (!this.timestamp) this.timestamp = new Date();
    next();
});
