import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import createError from "http-errors";
import { successResponse } from "../responsControllers";

export const getConversionData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return successResponse(res, {
        statusCode: 200,
        message: "Conversion data retrieved successfully",
        payload: {
          funnel: [
            { stage: "Visitors", count: 10000, percentage: 100 },
            { stage: "Signups", count: 2000, percentage: 20 },
            { stage: "Active Users", count: 1500, percentage: 15 },
            { stage: "Paid Users", count: 300, percentage: 3 },
          ],
          rates: {
            signupRate: 20,
            activationRate: 75,
            churnRate: 5,
            retentionRate: 95,
          },
        },
      });
    } catch (error) {
      console.error("Get conversion data error:", error);
      return next(createError(500, "Failed to retrieve conversion data"));
    }
  }
);
