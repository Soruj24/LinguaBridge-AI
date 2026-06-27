import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  {
    statusCode = 200,
    message = "Success",
    payload = {} as T,
  }: {
    statusCode?: number;
    message?: string;
    payload?: T;
  }
) {
  return res.status(statusCode).json({
    success: true,
    message,
    payload,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(
  res: Response,
  {
    statusCode = 500,
    message = "Internal Server Error",
    errors = [],
  }: {
    statusCode?: number;
    message?: string;
    errors?: unknown[];
  }
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
}
