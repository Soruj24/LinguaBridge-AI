export const rateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  sensitiveAction: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many sensitive actions attempted, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  paymentMethods: {
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many payment method requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  subscription: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many subscription requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  invoices: {
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many invoice requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
};
