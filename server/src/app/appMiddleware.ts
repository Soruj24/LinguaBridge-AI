import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import xss from "xss-clean";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { CLIENT_URL, NODE_ENV } from "../secret";

const app = express();

app.use(cookieParser());

const allowedOrigins = [
  CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (NODE_ENV !== "production" && origin.includes("localhost")) {
        return callback(null, true);
      }
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        return (
          origin === allowedOrigin ||
          origin === allowedOrigin.replace(/\/$/, "")
        );
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Request-Method",
      "Access-Control-Allow-Request-Headers",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 204,
  })
);

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    contentSecurityPolicy: NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 100 : 1000,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: NODE_ENV === "production" ? 20 : 100,
  message: { error: "Too many authentication attempts from this IP, please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: NODE_ENV === "production" ? 5 : 20,
  message: { error: "Too many password reset requests from this IP, please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default app;
export { limiter, authLimiter, forgotPasswordLimiter };
