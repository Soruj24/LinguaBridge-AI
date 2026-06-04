import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [incoming, outgoing] = await Promise.all([
      Friendship.find({
        recipient: currentUser._id,
        status: "pending",
      })
        .populate("requester", "name email avatar preferredLanguage")
        .sort({ createdAt: -1 }),
      Friendship.find({
        requester: currentUser._id,
        status: "pending",
      })
        .populate("recipient", "name email avatar preferredLanguage")
        .sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      incoming: incoming.map((r) => ({
        _id: r._id,
        user: r.requester,
        createdAt: r.createdAt,
      })),
      outgoing: outgoing.map((r) => ({
        _id: r._id,
        user: r.recipient,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
