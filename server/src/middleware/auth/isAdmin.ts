import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { UserRole } from "../../models/interfaces/IUser";
import { AuthenticatedRequest } from "./tokenUtils";

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        if (!req.user) {
            throw createHttpError(401, "User not authenticated");
        }

        if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
            throw createHttpError(403, "Access denied: Administrator privileges required");
        }

        next();
    } catch (error) {
        next(error);
    }
};
