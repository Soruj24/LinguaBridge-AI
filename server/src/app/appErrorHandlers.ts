import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import createError, { HttpError } from "http-errors";
import { NODE_ENV } from "../secret";
import { errorResponse } from "../controllers/responsControllers";
import app from "./appMiddleware";

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = createError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (NODE_ENV !== "test") {
    console.error(`Error ${err.status || 500}: ${err.message}`);
    if (NODE_ENV === "development") {
      console.error(err.stack);
    }
  }

  const isDevelopment = NODE_ENV === "development";
  const statusCode = err.status || err.statusCode || 500;

  errorResponse(res, {
    statusCode,
    message:
      statusCode === 500 && !isDevelopment
        ? "Internal Server Error"
        : err.message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

app.use(errorHandler);
