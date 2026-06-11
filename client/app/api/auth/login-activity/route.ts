import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import LoginActivity from "@/models/LoginActivity";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");

    await connectDB();

    const query: Record<string, unknown> = { email: session.user.email };
    if (type) {
      query.type = type;
    }

    const total = await LoginActivity.countDocuments(query);
    const activities = await LoginActivity.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Login activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch login activity" },
      { status: 500 }
    );
  }
}