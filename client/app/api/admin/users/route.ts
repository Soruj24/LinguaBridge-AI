import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role");
    const isActiveParam = searchParams.get("isActive");

    const query: Record<string, unknown> = {};

    if (q && q.length >= 2) {
      query["$or"] = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role === "user" || role === "admin") {
      query["role"] = role;
    }
    if (isActiveParam === "true" || isActiveParam === "false") {
      query["isActive"] = isActiveParam === "true";
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("name email avatar preferredLanguage role isActive createdAt lastLogin")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}