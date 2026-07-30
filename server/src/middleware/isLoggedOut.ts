import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { env } from "../shared/env";
import { verifyJSONWebToken } from "../helper/jsonwebtoken";
import { extractToken, clearAuthCookie } from "./tokenUtils";

export const isLoggedOut = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next();  
        }

        if (!env.JWT_ACCESS_SECRET) {
            return next(); 
        }

        try {
            verifyJSONWebToken(token, env.JWT_ACCESS_SECRET);
            return next(createHttpError(400, "User is already logged in"));
        } catch (error) {
            clearAuthCookie(res);

            if (error instanceof createHttpError.HttpError && error.statusCode === 400) {
                throw error;
            }
            next();
        }
    } catch (error) {
        next(error);
    }
};

