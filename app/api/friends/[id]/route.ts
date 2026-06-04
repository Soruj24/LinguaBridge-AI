import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import { getIO } from "@/lib/socket-io";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendship = await Friendship.findById(id);
    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    const isParticipant =
      friendship.requester.toString() === currentUser._id.toString() ||
      friendship.recipient.toString() === currentUser._id.toString();

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (friendship.status !== "accepted") {
      return NextResponse.json({ error: "Can only remove accepted friendships" }, { status: 400 });
    }

    await Friendship.findByIdAndDelete(id);
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !["accept", "reject", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept', 'reject', or 'cancel'" },
        { status: 400 }
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendship = await Friendship.findById(id).populate(
      "requester",
      "name email avatar preferredLanguage"
    );
    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (action === "cancel") {
      if (friendship.requester._id.toString() !== currentUser._id.toString()) {
        return NextResponse.json(
          { error: "Only the sender can cancel this request" },
          { status: 403 }
        );
      }
      if (friendship.status !== "pending") {
        return NextResponse.json(
          { error: "Can only cancel pending requests" },
          { status: 400 }
        );
      }
      friendship.status = "rejected";
      await friendship.save();
      return NextResponse.json({ status: "cancelled" });
    }

    if (friendship.recipient.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to respond to this request" },
        { status: 403 }
      );
    }

    if (friendship.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been handled" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      friendship.status = "accepted";
      await friendship.save();

      const io = getIO();
      if (io) {
        io.to(friendship.requester._id.toString()).emit("friend_request_accepted", {
          friendshipId: friendship._id,
          acceptor: { name: currentUser.name, _id: currentUser._id, avatar: currentUser.avatar },
        });
      }

      return NextResponse.json({
        friendship,
        status: "accepted",
      });
    } else {
      friendship.status = "rejected";
      await friendship.save();

      return NextResponse.json({
        friendship,
        status: "rejected",
      });
    }
  } catch (error) {
    console.error("Error handling friend request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
