import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

import { successResponse } from "./responseControllers";
import { AuthRequest } from "../types";
import Session from "../models/Session";
import { asyncHandler } from "../middleware/asyncHandler";

const handleGetSessions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    const sessions = await Session.find({ userId, revokedAt: { $exists: false } }).sort({ lastActiveAt: -1 });
    return successResponse(res, { statusCode: 200, message: "Sessions retrieved successfully", payload: { sessions } });
  }
);

const handleRevokeSession = asyncHandler(
  async (req: Request<{ sessionId: string }>, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const userId = (req as AuthRequest).user!._id;
    const session = await Session.findOne({ _id: sessionId, userId, revokedAt: { $exists: false } });
    if (!session) return next(createError(404, "Session not found"));
    session.revokedAt = new Date();
    session.revokedBy = userId;
    await session.save();
    if (session.accessToken === req.cookies.accessToken) { res.clearCookie("accessToken"); res.clearCookie("refreshToken"); }
    return successResponse(res, { statusCode: 200, message: "Session revoked successfully" });
  }
);

const handleRevokeAllSessions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!._id;
    await Session.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date(), revokedBy: userId });
    res.clearCookie("accessToken"); res.clearCookie("refreshToken");
    return successResponse(res, { statusCode: 200, message: "All sessions revoked successfully" });
  }
);

export { handleGetSessions, handleRevokeSession, handleRevokeAllSessions };
