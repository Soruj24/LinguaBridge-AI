import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectDB();

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (message.status !== "scheduled") {
      return NextResponse.json(
        { error: "Message has already been sent" },
        { status: 400 }
      );
    }

    await Message.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling scheduled message:", error);
    return NextResponse.json(
      { error: "Failed to cancel scheduled message" },
      { status: 500 }
    );
  }
}
