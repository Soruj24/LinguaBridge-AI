import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { jwtAccessKey } from "../../secret";
import { verifyJSONWebToken, createJSONWebToken } from "../../helper/jsonwebtoken";
import { AuthenticatedRequest, extractToken, setAuthCookie } from "./tokenUtils";

export const refreshTokenIfNeeded = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token || !jwtAccessKey) {
            return next();
        }

        try {
            const decoded = verifyJSONWebToken(token, jwtAccessKey);
            const now = Math.floor(Date.now() / 1000);
            const tokenExp = decoded.exp;

            if (tokenExp && (tokenExp - now) < 1800) {
                const newToken = createJSONWebToken({ id: decoded.id || decoded.userId }, jwtAccessKey, '7d');
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
