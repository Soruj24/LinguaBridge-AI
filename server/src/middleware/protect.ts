import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { env } from "../shared/env";
import { verifyJSONWebToken } from "../helper/jsonwebtoken";
import User from "../models/User";
import { UserRole } from "../models/User";
import { AuthenticatedRequest, extractToken, clearAuthCookie } from "./tokenUtils";

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw createHttpError(401, "Unauthorized access, please login first");
        }

        if (!env.JWT_ACCESS_SECRET) {
            throw createHttpError(500, "JWT secret key is not configured");
        }

        const decoded = verifyJSONWebToken(token, env.JWT_ACCESS_SECRET);

        const userId = decoded.id || decoded.userId;
        if (!userId) {
            clearAuthCookie(res);
            throw createHttpError(401, "Invalid authorization token");
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            clearAuthCookie(res);
            throw createHttpError(404, "User not found or has been deleted");
        }

        req.user = {
            _id: user.id.toString(),
            email: user.email || '',
            role: user.role as UserRole,
            permissions: user.permissions || [],
            isAdmin: user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
        };

        next();
    } catch (error) {
        if (error instanceof createHttpError.HttpError && error.statusCode === 401) {
            clearAuthCookie(res);
        }
        next(error);
    }
};


