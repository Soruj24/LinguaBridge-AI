import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { jwtAccessKey } from "../../secret";
import { verifyJSONWebToken } from "../../helper/jsonwebtoken";
import { extractToken, clearAuthCookie } from "./tokenUtils";

export const isLoggedOut = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next();  
        }

        if (!jwtAccessKey) {
            return next(); 
        }

        try {
            verifyJSONWebToken(token, jwtAccessKey);
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
