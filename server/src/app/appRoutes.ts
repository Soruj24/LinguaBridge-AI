import { Request, Response } from "express";
import authRouter from "../routes/authRouter";
import analyticsRouter from "../routes/analyticsRouter";
import ipRouter from "../routes/ipRouter";
import seedRouter from "../routes/seedRouter";
import billingRouter from "../routes/billingRouter";
import supportRouter from "../routes/supportRouter";
import aiRouter from "../routes/aiRouter";
import fileRouter from "../routes/fileRouter";

import messageRouter from "../routes/messageRouter";
import friendsRouter from "../routes/friendsRouter";
import chatCompatRouter from "../routes/chatCompatRouter";
import userCompatRouter from "../routes/userCompatRouter";
import userCompatExtendedRouter from "../routes/userCompatExtendedRouter";
import adminCompatRouter from "../routes/adminCompatRouter";
import phrasebookRouter from "../routes/phrasebookRouter";
import foldersRouter from "../routes/foldersRouter";
import reportRouter from "../routes/reportRouter";
import registerRouter from "../routes/registerRouter";
import notificationCompatRouter from "../routes/notificationCompatRouter";
import { env } from "../shared/env";

const NODE_ENV = env.NODE_ENV;
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

// Compat routes (must be before parametric routes)
app.use("/api/chat", chatCompatRouter);
app.use("/api/user", userCompatRouter);
app.use("/api/user", userCompatExtendedRouter);
app.use("/api/admin", adminCompatRouter);
app.use("/api/phrasebook", phrasebookRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/report", reportRouter);
app.use("/api/register", registerRouter);
app.use("/api/notifications", notificationCompatRouter);

// app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/ip", ipRouter);
app.use("/api/seed", seedRouter);
app.use("/api/billing", billingRouter);
app.use("/api/support", supportRouter);
app.use("/api/ai", aiRouter);
app.use("/api/files", fileRouter);
app.use("/api/notifications", notificationCompatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/friends", friendsRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
