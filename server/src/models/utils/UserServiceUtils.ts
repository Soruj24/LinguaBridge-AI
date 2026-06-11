import { createUser } from './userCreate';
import { authenticateUser } from './userAuth';
import { getUserDashboard } from './userDashboard';
import { batchUserOperations } from './userBatchOps';
import { advancedUserSearch } from './userSearch';

export const UserServiceUtils = {
    createUser,
    authenticateUser,
    getUserDashboard,
    batchUserOperations,
    advancedUserSearch
};
