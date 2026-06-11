import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import User from "../../models/schemas/User";
import Invoice from "../../models/Invoice";
import createError from "http-errors";
import { successResponse } from "../responsControllers";

export const exportAnalyticsData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, format } = req.body;

      let data = "";
      let fileName = `analytics-export-${type}-${Date.now()}`;

      if (type === "users") {
        const users = await User.find().select("username email role status createdAt").limit(100);
        if (format === "csv") {
          data = "Username,Email,Role,Status,Created At\n";
          users.forEach(user => {
            data += `${user.username},${user.email},${user.role},${user.status},${user.createdAt}\n`;
          });
          fileName += ".csv";
          res.setHeader("Content-Type", "text/csv");
        } else {
          data = JSON.stringify(users, null, 2);
          fileName += ".json";
          res.setHeader("Content-Type", "application/json");
        }
      } else if (type === "revenue") {
        const invoices = await Invoice.find({ status: "paid" }).populate("userId", "username email").limit(100);
        if (format === "csv") {
          data = "Invoice ID,Amount,Customer,Date\n";
          invoices.forEach((inv: any) => {
            const customerName = inv.userId ? (inv.userId as any).username : "N/A";
            data += `${inv._id},${inv.amount},${customerName},${inv.paidAt}\n`;
          });
          fileName += ".csv";
          res.setHeader("Content-Type", "text/csv");
        } else {
          data = JSON.stringify(invoices, null, 2);
          fileName += ".json";
          res.setHeader("Content-Type", "application/json");
        }
      } else {
        data = "Date,Metric,Value\n2024-01-01,Users,100\n2024-01-02,Users,110";
        fileName += ".csv";
        res.setHeader("Content-Type", "text/csv");
      }

      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      return res.status(200).send(data);
    } catch (error) {
      console.error("Export analytics error:", error);
      return next(createError(500, "Failed to export analytics data"));
    }
  }
);
