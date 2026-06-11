import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { jwtAccessKey } from "../../secret";
import { verifyJSONWebToken } from "../../helper/jsonwebtoken";
import User from "../../models/schemas/User";
import { UserRole } from "../../models/interfaces/IUser";
import { AuthenticatedRequest, extractToken, clearAuthCookie } from "./tokenUtils";

export const isLoggedIn = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

        const token = extractToken(req);

        if (!token) {
            if (req?.cookies?.accessToken) {
                clearAuthCookie(res);
            }
            throw createHttpError(401, "Please login first");
        }

        if (!jwtAccessKey) {
            throw createHttpError(500, "JWT secret key is not configured");
        }
 
        const decoded = verifyJSONWebToken(token, jwtAccessKey);
        
        const userId = decoded.id || decoded.userId;
        if (!userId) {
            clearAuthCookie(res);  
            throw createHttpError(401, "Invalid user identifier in token");
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            clearAuthCookie(res);  
            throw createHttpError(404, "User not found");
        }

        req.user = {
            _id: user.id.toString(),
            email: user.email || '',
            role: user.role as UserRole,
            permissions: user.permissions || [],
            isAdmin: user.isAdmin || user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
        };
 
        next();
    } catch (error) {
        if (error instanceof createHttpError.HttpError && error.statusCode === 401) {
            clearAuthCookie(res);
        }
        next(error);
    }
};
