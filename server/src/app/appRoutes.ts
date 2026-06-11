import { Request, Response } from "express";
import authRouter from "../routes/authRouter";
import analyticsRouter from "../routes/analyticsRouter";
import ipRouter from "../routes/ipRouter";
import seedRouter from "../routes/seedRouter";
import billingRouter from "../routes/billingRouter";
import supportRouter from "../routes/supportRouter";
import aiRouter from "../routes/aiRouter";
import fileRouter from "../routes/fileRouter";
import notificationRouter from "../routes/notificationRouter";
import { NODE_ENV } from "../secret";
import { limiter, authLimiter, forgotPasswordLimiter } from "./appMiddleware";
import app from "./appMiddleware";

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: "1.0.0",
  });
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", forgotPasswordLimiter);
app.use("/api/auth/reset-password", forgotPasswordLimiter);

// app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/ip", ipRouter);
app.use("/api/seed", seedRouter);
app.use("/api/billing", billingRouter);
app.use("/api/support", supportRouter);
app.use("/api/ai", aiRouter);
app.use("/api/files", fileRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
