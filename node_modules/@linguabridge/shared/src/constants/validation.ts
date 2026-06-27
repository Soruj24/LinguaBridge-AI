export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    UPPERCASE_REGEX: /[A-Z]/,
    LOWERCASE_REGEX: /[a-z]/,
    DIGIT_REGEX: /\d/,
    SPECIAL_REGEX: /\W/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 10000,
  FEEDBACK_MIN_LENGTH: 10,
} as const;

export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },
  CHAT: {
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 30,
  },
} as const;
