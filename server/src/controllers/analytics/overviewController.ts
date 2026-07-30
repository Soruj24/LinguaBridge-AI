import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import Invoice from "../../models/Invoice";
import User from "../../models/User";
import { SupportTicket } from "../../models/SupportTicket";
import createError from "http-errors";
import { successResponse } from "../responseControllers";

export const getOverviewStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = (req.query.period as string) || "30days";
      const endDate = new Date();
      const startDate = new Date();

      if (period === "7days") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === "30days") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === "90days") {
        startDate.setDate(endDate.getDate() - 90);
      } else if (period === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const ticketStats = await SupportTicket.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            open: [{ $match: { status: "open" } }, { $count: "count" }],
            inProgress: [
              { $match: { status: "in-progress" } },
              { $count: "count" },
            ],
            resolved: [{ $match: { status: "resolved" } }, { $count: "count" }],
          },
        },
      ]);

      const totalTickets = ticketStats[0].total[0]?.count || 0;
      const openTickets = ticketStats[0].open[0]?.count || 0;
      const inProgressTickets = ticketStats[0].inProgress[0]?.count || 0;
      const activeTickets = openTickets + inProgressTickets;

      const userStats = await User.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { status: "active" } }, { $count: "count" }],
            new: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" },
            ],
          },
        },
      ]);

      const totalUsers = userStats[0].total[0]?.count || 0;
      const activeUsers = userStats[0].active[0]?.count || 0;
      const newUsers = userStats[0].new[0]?.count || 0;

      const revenueStats = await Invoice.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalRevenue = revenueStats[0]?.totalRevenue || 0;
      const totalSales = revenueStats[0]?.count || 0;

      const prevStartDate = new Date(startDate);
      if (period === "7days") prevStartDate.setDate(startDate.getDate() - 7);
      else if (period === "30days") prevStartDate.setDate(startDate.getDate() - 30);
      else if (period === "90days") prevStartDate.setDate(startDate.getDate() - 90);
      else if (period === "year") prevStartDate.setFullYear(startDate.getFullYear() - 1);

      const prevRevenueStats = await Invoice.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: prevStartDate, $lt: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      const prevRevenue = prevRevenueStats[0]?.totalRevenue || 0;
      const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;

      return successResponse(res, {
        statusCode: 200,
        message: "Overview statistics retrieved successfully",
        payload: {
          totalUsers,
          activeUsers,
          newUsers,
          totalRevenue,
          totalSales,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          totalTickets,
          activeTickets,
          openTickets,
          inProgressTickets,
          period,
        },
      });
    } catch (error) {
      console.error("Get overview stats error:", error);
      return next(createError(500, "Failed to retrieve overview statistics"));
    }
  }
);

