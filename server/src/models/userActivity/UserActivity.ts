import { model } from 'mongoose';
import { UserActivitySchema } from './userActivitySchema';
import { applyUserActivityStatics } from './userActivityStatics';
import { IUserActivity, IUserActivityModel } from './userActivityTypes';

applyUserActivityStatics(UserActivitySchema);
const UserActivity: IUserActivityModel = model<IUserActivity, IUserActivityModel>('UserActivity', UserActivitySchema);

export default UserActivity;
