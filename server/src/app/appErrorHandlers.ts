import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import createError from "http-errors";
import { env } from "../shared/env";
import { sendError } from "../shared/response";
import { logger } from "../shared/logger";
import { AppError } from "../shared/errors";
import app from "./appMiddleware";

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = createError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = env.NODE_ENV === "development";

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
      stack: err.stack,
      statusCode,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`, {
      statusCode,
    });
  }

  sendError(res, {
    statusCode,
    message:
      statusCode === 500 && !isDevelopment
        ? "Internal Server Error"
        : err.message,
    ...(isDevelopment && { errors: [{ stack: err.stack }] }),
  });
};

app.use(errorHandler);
