import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import Invoice from "../../models/Invoice";
import createError from "http-errors";
import { successResponse } from "../responseControllers";

export const getRevenueData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = (req.query.period as string) || "30days";
      const endDate = new Date();
      const startDate = new Date();

      let groupByFormat = "%Y-%m-%d";
      if (period === "7days" || period === "30days") {
        startDate.setDate(endDate.getDate() - (period === "7days" ? 7 : 30));
        groupByFormat = "%Y-%m-%d";
      } else if (period === "90days") {
        startDate.setDate(endDate.getDate() - 90);
        groupByFormat = "%Y-%U";
      } else if (period === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1);
        groupByFormat = "%Y-%m";
      }

      const revenueData = await Invoice.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: groupByFormat, date: "$paidAt" } },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return successResponse(res, {
        statusCode: 200,
        message: "Revenue data retrieved successfully",
        payload: revenueData.map(item => ({
          date: item._id,
          revenue: item.revenue,
        })),
      });
    } catch (error) {
      console.error("Get revenue data error:", error);
      return next(createError(500, "Failed to retrieve revenue data"));
    }
  }
);
