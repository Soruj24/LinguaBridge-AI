import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
});

export const userSecurityMiddleware = [
    securityHeaders,
    (req: Request, res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] User operation: ${req.method} ${req.path} from IP: ${req.ip}`);
        next();
    }
];
