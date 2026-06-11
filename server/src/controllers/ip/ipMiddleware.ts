import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

export const ipRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many IP lookup requests, please try again later.",
    error: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const addRequestStartTime = (req: Request, res: Response, next: NextFunction) => {
  (req as any).startTime = Date.now();
  next();
};

export const debugIPMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== IP DEBUG INFO ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('req.ip:', req.ip);
  console.log('req.connection.remoteAddress:', req.connection?.remoteAddress);
  console.log('req.socket.remoteAddress:', req.socket?.remoteAddress);
  console.log('========================');
  next();
};
