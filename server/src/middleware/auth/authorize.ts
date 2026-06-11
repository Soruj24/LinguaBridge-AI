import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { UserRole } from "../../models/interfaces/IUser";
import { AuthenticatedRequest } from "./tokenUtils";

export const authorize = (allowedRoles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw createHttpError(401, "User not authenticated");
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw createHttpError(403, `Access denied: ${req.user.role} role does not have permission to access this resource`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
