import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import Notification from "@/models/Notification";
import { isBlocked } from "@/lib/block-check";
import { getIO } from "@/lib/socket-io";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId } = await req.json();
    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser._id.toString() === recipientId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const blocked = await isBlocked(currentUser._id.toString(), recipientId);
    if (blocked) {
      return NextResponse.json(
        { error: "Unable to send friend request" },
        { status: 403 }
      );
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: currentUser._id, recipient: recipientId },
        { requester: recipientId, recipient: currentUser._id },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json(
          { error: "Already friends" },
          { status: 400 }
        );
      }
      if (existing.status === "pending") {
        const isOutgoing =
          existing.requester.toString() === currentUser._id.toString();
        return NextResponse.json(
          {
            error: isOutgoing
              ? "Friend request already sent"
              : "This user has already sent you a request",
            existingRequest: existing,
          },
          { status: 400 }
        );
      }
      if (existing.status === "rejected") {
        existing.status = "pending";
        existing.requester = currentUser._id;
        existing.recipient = recipientId;
        await existing.save();

        await Notification.create({
          userId: recipientId,
          type: "friend_request",
          title: "Friend Request",
          message: `${currentUser.name} sent you a friend request`,
          link: "/dashboard",
        });

        const io = getIO();
        if (io) {
          io.to(recipientId).emit("friend_request_received", {
            requestId: existing._id,
            sender: { name: currentUser.name, _id: currentUser._id, avatar: currentUser.avatar },
          });
        }

        return NextResponse.json({ request: existing });
      }
    }

    const friendship = await Friendship.create({
      requester: currentUser._id,
      recipient: recipientId,
      status: "pending",
    });

    await Notification.create({
      userId: recipientId,
      type: "friend_request",
      title: "Friend Request",
      message: `${currentUser.name} sent you a friend request`,
      link: "/dashboard",
    });

    const io = getIO();
    if (io) {
      io.to(recipientId).emit("friend_request_received", {
        requestId: friendship._id,
        sender: { name: currentUser.name, _id: currentUser._id, avatar: currentUser.avatar },
      });
    }

    return NextResponse.json({ request: friendship }, { status: 201 });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
