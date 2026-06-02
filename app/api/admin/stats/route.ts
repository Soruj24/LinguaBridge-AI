import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import LoginActivity from "@/models/LoginActivity";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalChats,
      totalMessages,
      recentUsers,
      activeUsersList,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      Chat.countDocuments(),
      Message.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt role"),
      User.find({ isActive: true }).limit(10).select("name email lastLogin"),
    ]);

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [usersLast7Days, usersLast30Days, messagesLast7Days, activeChats] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Message.countDocuments({ createdAt: { $gte: last7Days } }),
      Chat.countDocuments({ updatedAt: { $gte: last7Days } }),
    ]);

    const languageStats = await User.aggregate([
      { $group: { _id: "$preferredLanguage", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentActivity = await LoginActivity.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select("email type success timestamp ipAddress browser os");

    const dailyUserStats = await User.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyMessageStats = await Message.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyChatStats = await Chat.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          newLast7Days: usersLast7Days,
          newLast30Days: usersLast30Days,
        },
        chats: {
          total: totalChats,
          activeLast7Days: activeChats,
        },
        messages: {
          total: totalMessages,
          last7Days: messagesLast7Days,
        },
      },
      recentUsers,
      activeUsersList,
      languageStats,
      recentActivity,
      chartData: {
        users: dailyUserStats,
        messages: dailyMessageStats,
        chats: dailyChatStats,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}