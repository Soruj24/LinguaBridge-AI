import { Router, Request, Response } from "express";
import {
  getOverviewStats,
  getRevenueData,
  getUserAnalytics,
  getRecentActivity,
  getTopProducts,
  getConversionData,
  exportAnalyticsData,
} from "../controllers/analytics";
import { isLoggedIn, isAdmin, hasPermission } from "../middleware";
import { Permission } from "../models/User";
import connectDB from "../config/connectDB";
import { ChatMessage, Chat } from "../models/chat/index";

const analyticsRouter = Router();

// â”€â”€ Public compat routes (no auth) â”€â”€
analyticsRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    await connectDB();
    const totalMessages = await ChatMessage.countDocuments({ status: "sent" });
    const totalTranslations = await ChatMessage.countDocuments({ translatedText: { $exists: true, $ne: null } });
    const totalVoice = await ChatMessage.countDocuments({ voiceUrl: { $exists: true, $ne: null } });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const prevThirtyDays = new Date();
    prevThirtyDays.setDate(prevThirtyDays.getDate() - 60);

    const recentMessages = await ChatMessage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prevMessages = await ChatMessage.countDocuments({ createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } });
    const recentTranslations = await ChatMessage.countDocuments({ translatedText: { $exists: true, $ne: null }, createdAt: { $gte: thirtyDaysAgo } });
    const prevTranslations = await ChatMessage.countDocuments({ translatedText: { $exists: true, $ne: null }, createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } });
    const recentVoice = await ChatMessage.countDocuments({ voiceUrl: { $exists: true, $ne: null }, createdAt: { $gte: thirtyDaysAgo } });
    const prevVoice = await ChatMessage.countDocuments({ voiceUrl: { $exists: true, $ne: null }, createdAt: { $gte: prevThirtyDays, $lt: thirtyDaysAgo } });

    const msgDelta = recentMessages - prevMessages;
    const transDelta = prevTranslations === 0 ? 100 : Math.round(((recentTranslations - prevTranslations) / prevTranslations) * 100);
    const voiceDelta = recentVoice - prevVoice;

    res.json({
      data: {
        messages: { total: totalMessages, delta: msgDelta },
        translations: { total: totalTranslations, deltaPercent: transDelta },
        voiceTranslations: { total: totalVoice, delta: voiceDelta },
      },
    });
  } catch {
    res.json({ data: { messages: { total: 0, delta: 0 }, translations: { total: 0, deltaPercent: 0 }, voiceTranslations: { total: 0, delta: 0 } } });
  }
});

analyticsRouter.get("/language-usage", async (req: Request, res: Response) => {
  try {
    await connectDB();
    const limit = parseInt((req.query.limit as string) || "8");

    const result = await ChatMessage.aggregate([
      { $match: { languageFrom: { $exists: true, $ne: null } } },
      { $group: { _id: "$languageFrom", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, code: "$_id", count: 1 } },
    ]);

    res.json({ data: result });
  } catch {
    res.json({ data: [] });
  }
});

// Apply authentication and permission protection to all analytics routes
analyticsRouter.use(isLoggedIn);
analyticsRouter.use(hasPermission(Permission.ANALYTICS_VIEW));

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview statistics for the admin dashboard
 */
analyticsRouter.get("/overview", getOverviewStats);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue data over time
 */
analyticsRouter.get("/revenue", getRevenueData);

/**
 * @route   GET /api/analytics/users
 * @desc    Get user analytics data
 */
analyticsRouter.get("/users", getUserAnalytics);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top products analytics
 */
analyticsRouter.get("/top-products", getTopProducts);

/**
 * @route   GET /api/analytics/conversion
 * @desc    Get conversion analytics
 */
analyticsRouter.get("/conversion", getConversionData);

/**
 * @route   POST /api/analytics/export
 * @desc    Export analytics data
 */
analyticsRouter.post("/export", exportAnalyticsData);

/**
 * @route   GET /api/analytics/recent-activity
 * @desc    Get recent activities
 */
analyticsRouter.get("/recent-activity", getRecentActivity);

export default analyticsRouter;


