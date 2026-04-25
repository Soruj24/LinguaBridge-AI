import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import LoginActivity from "@/models/LoginActivity";
import { z } from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmText: z.string().refine((val) => val === "DELETE", {
    message: 'You must type "DELETE" to confirm',
  }),
});

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password, confirmText } = deleteAccountSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 400 }
        );
      }
    }

    const userId = user._id;

    await Message.deleteMany({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    });

    await Chat.deleteMany({
      participants: userId,
    });

    await LoginActivity.deleteMany({
      userId: userId,
    });

    await User.deleteOne({ _id: userId });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user._id.toString(),
      email: user.email,
      memberSince: user.createdAt,
      hasPassword: !!user.password,
    });
  } catch (error) {
    console.error("Get account info error:", error);
    return NextResponse.json(
      { error: "Failed to get account info" },
      { status: 500 }
    );
  }
}