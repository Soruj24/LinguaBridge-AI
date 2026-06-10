import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Block from "@/models/Block";
import Friendship from "@/models/Friendship";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blockedUserId } = await req.json();
    if (!blockedUserId) {
      return NextResponse.json({ error: "blockedUserId is required" }, { status: 400 });
    }

    await connectDB();

    if (session.user.id === blockedUserId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const blockedUser = await User.findById(blockedUserId);
    if (!blockedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingBlock = await Block.findOne({
      blocker: session.user.id,
      blocked: blockedUserId,
    });
    if (existingBlock) {
      return NextResponse.json({ error: "User already blocked" }, { status: 400 });
    }

    // Delete friendship if they are friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester: session.user.id, recipient: blockedUserId, status: "accepted" },
        { requester: blockedUserId, recipient: session.user.id, status: "accepted" },
      ],
    });
    if (friendship) {
      await Friendship.findByIdAndDelete(friendship._id);
    }

    // Remove any existing friend requests
    await Friendship.deleteMany({
      $or: [
        { requester: session.user.id, recipient: blockedUserId },
        { requester: blockedUserId, recipient: session.user.id },
      ],
    });

    const block = await Block.create({
      blocker: session.user.id,
      blocked: blockedUserId,
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const blocks = await Block.find({ blocker: session.user.id })
      .populate("blocked", "_id name avatar bio")
      .lean();

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
