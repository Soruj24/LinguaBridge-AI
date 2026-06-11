import { Schema } from 'mongoose';
import { INotification } from './notificationTypes';

export function applyNotificationMethods(schema: Schema<INotification>) {
    schema.methods.markAsRead = function () {
        this.read = true;
        this.readAt = new Date();
        return this.save();
    };
}
