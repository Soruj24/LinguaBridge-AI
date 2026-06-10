import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import UserStatus from "@/models/UserStatus";
import User from "@/models/User";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await context.params;
    await connectDB();

    const [status, user] = await Promise.all([
      UserStatus.findOne({ userId }).lean(),
      User.findById(userId).select("showLastSeen").lean(),
    ]);

    return NextResponse.json({
      userId,
      isOnline: status?.isOnline ?? false,
      lastSeen: status?.lastSeen ?? null,
      showLastSeen: user?.showLastSeen ?? true,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
