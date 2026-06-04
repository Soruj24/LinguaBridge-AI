import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const regex = new RegExp(query, "i");
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } },
        { isActive: true },
        { $or: [{ name: regex }, { email: regex }] },
      ],
    })
      .select("name email avatar preferredLanguage")
      .limit(10)
      .lean();

    const userIds = users.map((u) => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUser._id, recipient: { $in: userIds } },
        { recipient: currentUser._id, requester: { $in: userIds } },
      ],
    });

    const friendStatusMap = new Map<string, string>();
    for (const f of friendships) {
      const otherId =
        f.requester.toString() === currentUser._id.toString()
          ? f.recipient.toString()
          : f.requester.toString();

      if (f.status === "accepted") {
        friendStatusMap.set(otherId, "friends");
      } else if (f.status === "pending") {
        const isOutgoing =
          f.requester.toString() === currentUser._id.toString();
        friendStatusMap.set(otherId, isOutgoing ? "request_sent" : "request_received");
      }
    }

    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      preferredLanguage: u.preferredLanguage,
      friendStatus: friendStatusMap.get(u._id.toString()) ?? "none",
    }));

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
