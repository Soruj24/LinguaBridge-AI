import { Request } from "express";

export const getClientIP = (req: Request): string => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    "Unknown"
  );
};
