// Re-export from existing service locations for backward compatibility
export { getUser, getOrCreateUser } from "../../services/auth/userService";
export { logLoginActivity, parseUserAgent } from "../../services/auth/activityService";
export { authorizeCredentials } from "../../services/auth/credentialsService";
