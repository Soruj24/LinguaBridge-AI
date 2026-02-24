import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role");
    const isActiveParam = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const baseQuery: Record<string, unknown> =
      session.user.role === "admin"
        ? {}
        : { email: { $ne: session.user.email } };

    if (q && q.length >= 2) {
      baseQuery["$or"] = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role === "user" || role === "admin") {
      baseQuery["role"] = role;
    }
    if (isActiveParam === "true" || isActiveParam === "false") {
      baseQuery["isActive"] = isActiveParam === "true";
    }

    const total = await User.countDocuments(baseQuery);
    const users = await User.find(baseQuery)
      .select("name email avatar preferredLanguage role isActive")
      .sort({ [sortBy]: sortOrder })
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
