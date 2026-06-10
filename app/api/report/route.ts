import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Report from "@/models/Report";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportedUserId, reason, description } = await req.json();

    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { error: "reportedUserId and reason are required" },
        { status: 400 }
      );
    }

    const validReasons = ["spam", "harassment", "inappropriate", "fake_account", "other"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be under 1000 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    if (session.user.id === reportedUserId) {
      return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const report = await Report.create({
      reporter: session.user.id,
      reportedUser: reportedUserId,
      reason,
      description: description || "",
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error reporting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
