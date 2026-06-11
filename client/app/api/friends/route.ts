import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import Block from "@/models/Block";

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

    const friendships = await Friendship.find({
      $or: [
        { requester: currentUser._id, status: "accepted" },
        { recipient: currentUser._id, status: "accepted" },
      ],
    })
      .populate("requester", "name email avatar preferredLanguage")
      .populate("recipient", "name email avatar preferredLanguage")
      .sort({ updatedAt: -1 });

    const blockedUsers = await Block.find({
      $or: [
        { blocker: currentUser._id },
        { blocked: currentUser._id },
      ],
    }).lean();
    const blockedIds = new Set(
      blockedUsers.map((b) =>
        b.blocker.toString() === currentUser._id.toString()
          ? b.blocked.toString()
          : b.blocker.toString()
      ),
    );

    const friends = friendships
      .map((f) => {
        const isRequester = f.requester._id.toString() === currentUser._id.toString();
        return {
          friendshipId: f._id,
          user: isRequester ? f.recipient : f.requester,
          since: f.createdAt,
        };
      })
      .filter((f) => !blockedIds.has(f.user._id.toString()));

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
