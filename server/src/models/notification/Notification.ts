import { model, Model } from 'mongoose';
import { NotificationSchema } from './notificationSchema';
import { applyNotificationStatics } from './notificationStatics';
import { applyNotificationMethods } from './notificationMethods';
import { INotification } from './notificationTypes';

applyNotificationStatics(NotificationSchema);
applyNotificationMethods(NotificationSchema);
const Notification: Model<INotification> = model<INotification>('Notification', NotificationSchema);

export default Notification;
