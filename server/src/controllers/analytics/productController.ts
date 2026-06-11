import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import createError from "http-errors";
import { successResponse } from "../responsControllers";

export const getTopProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = [
        {
          id: "1",
          name: "Premium Subscription",
          sku: "SUB-PREM",
          category: "Subscriptions",
          sales: 150,
          revenue: 1500,
          unitsSold: 150,
          growth: 15,
          conversionRate: 8.5,
          stock: 999,
          avgRating: 4.8,
          reviews: 45,
        },
        {
          id: "2",
          name: "Basic Plan",
          sku: "SUB-BASIC",
          category: "Subscriptions",
          sales: 300,
          revenue: 900,
          unitsSold: 300,
          growth: 10,
          conversionRate: 12.2,
          stock: 999,
          avgRating: 4.5,
          reviews: 120,
        },
      ];

      return successResponse(res, {
        statusCode: 200,
        message: "Top products retrieved successfully",
        payload: {
          products,
          categories: [
            { category: "Subscriptions", revenue: 2400, products: 2, growth: 12 },
          ],
        },
      });
    } catch (error) {
      console.error("Get top products error:", error);
      return next(createError(500, "Failed to retrieve top products data"));
    }
  }
);
