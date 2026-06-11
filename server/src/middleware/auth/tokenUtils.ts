import { Request, Response } from "express";
import { UserRole, Permission } from "../../models/interfaces/IUser";

export interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        email: string;
        role: UserRole;
        permissions: Permission[];
        isAdmin: boolean;
    };
}

const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined
};

const extractToken = (req: Request): string | null => {
    try {
        if (req?.cookies?.accessToken) {
            const token = req.cookies.accessToken;
            if (token && token.trim() !== '') {
                return token;
            }
        }

        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                return token ? token : null;
            }
            return authHeader;
        }

        return null;
    } catch (error) {
        return null;
    }
};

const setAuthCookie = (res: Response, token: string): void => {
    res.cookie('accessToken', token, cookieConfig);
};

const clearAuthCookie = (res: Response): void => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: process.env.COOKIE_DOMAIN || undefined
    });
};

export { cookieConfig, extractToken, setAuthCookie, clearAuthCookie };
