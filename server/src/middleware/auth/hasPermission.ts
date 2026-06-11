import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { UserRole, Permission } from "../../models/interfaces/IUser";
import { AuthenticatedRequest } from "./tokenUtils";

export const hasPermission = (requiredPermission: Permission) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw createHttpError(401, "User not authenticated");
            }

            if (req.user.role === UserRole.SUPER_ADMIN) {
                return next();
            }

            if (!req.user.permissions.includes(requiredPermission)) {
                throw createHttpError(403, `Access denied: missing required permission "${requiredPermission}"`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const hasAllPermissions = (requiredPermissions: Permission[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw createHttpError(401, "User not authenticated");
            }

            if (req.user.role === UserRole.SUPER_ADMIN) {
                return next();
            }

            const hasAll = requiredPermissions.every(perm => req.user?.permissions.includes(perm));
            
            if (!hasAll) {
                throw createHttpError(403, "Access denied: missing one or more required permissions");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
