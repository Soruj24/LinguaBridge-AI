import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import createError from "http-errors";
import { successResponse } from "../responseControllers";

export const getUserAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = (req.query.period as string) || "30days";

      const demographics = {
        ageGroups: [
          { group: "18-24", users: 150, percentage: 15, growth: 5 },
          { group: "25-34", users: 450, percentage: 45, growth: 12 },
          { group: "35-44", users: 250, percentage: 25, growth: -2 },
          { group: "45+", users: 150, percentage: 15, growth: 3 },
        ],
        regions: [
          { region: "North America", users: 400, growth: 8, percentage: 40 },
          { region: "Europe", users: 300, growth: 5, percentage: 30 },
          { region: "Asia", users: 200, growth: 15, percentage: 20 },
          { region: "Other", users: 100, growth: 2, percentage: 10 },
        ],
        devices: [
          { device: "Desktop", users: 600, percentage: 60, avgSessionDuration: "12m" },
          { device: "Mobile", users: 350, percentage: 35, avgSessionDuration: "8m" },
          { device: "Tablet", users: 50, percentage: 5, avgSessionDuration: "10m" },
        ],
      };

      const behavior = {
        pageViews: 15000,
        avgSessionDuration: "10m 30s",
        bounceRate: 35.5,
        returningUsers: 65,
        newUsers: 35,
        pagesPerSession: 4.5,
        sessionsPerUser: 2.1,
        avgTimeOnPage: "2m 15s",
        topPages: [
          { page: "/dashboard", views: 5000, uniqueVisitors: 1200 },
          { page: "/profile", views: 3000, uniqueVisitors: 900 },
          { page: "/settings", views: 2000, uniqueVisitors: 800 },
        ],
      };

      const acquisition = {
        sources: [
          { source: "Direct", users: 400, percentage: 40, conversionRate: 5.2 },
          { source: "Google", users: 300, percentage: 30, conversionRate: 4.8 },
          { source: "Social Media", users: 200, percentage: 20, conversionRate: 3.5 },
          { source: "Referral", users: 100, percentage: 10, conversionRate: 6.1 },
        ],
        campaigns: [
          { campaign: "Summer Sale", users: 500, conversionRate: 7.2, revenue: 5000 },
          { campaign: "New Feature", users: 300, conversionRate: 4.5, revenue: 2000 },
        ],
      };

      return successResponse(res, {
        statusCode: 200,
        message: "User analytics retrieved successfully",
        payload: {
          demographics,
          behavior,
          acquisition,
        },
      });
    } catch (error) {
      console.error("Get user analytics error:", error);
      return next(createError(500, "Failed to retrieve user analytics data"));
    }
  }
);
