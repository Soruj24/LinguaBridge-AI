import rateLimit from "express-rate-limit";

export const rateLimitConfig = {
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    message: 'Too many registration attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  passwordReset: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 password reset attempts per window
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  twoFactor: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 2FA attempts per window
    message: 'Too many two-factor attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  sensitiveAction: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 sensitive actions per window
    message: 'Too many sensitive actions attempted, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
};
