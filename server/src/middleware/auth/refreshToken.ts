import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { env } from "../../shared/env";
import { verifyJSONWebToken, createJSONWebToken } from "../../helper/jsonwebtoken";
import { AuthenticatedRequest, extractToken, setAuthCookie } from "./tokenUtils";

export const refreshTokenIfNeeded = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token || !env.JWT_ACCESS_SECRET) {
            return next();
        }

        try {
            const decoded = verifyJSONWebToken(token, env.JWT_ACCESS_SECRET);
            const now = Math.floor(Date.now() / 1000);
            const tokenExp = decoded.exp;

            if (tokenExp && (tokenExp - now) < 1800) {
                const newToken = createJSONWebToken({ id: decoded.id || decoded.userId }, env.JWT_ACCESS_SECRET, '7d');
                setAuthCookie(res, newToken);
            }
        } catch (error) {
            next(error)
        }

        next();
    } catch (error) {
        next(error);
    }
};
