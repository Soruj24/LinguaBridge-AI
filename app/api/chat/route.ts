import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    const { searchParams } = new URL(req.url);
    const paginate = searchParams.get("paginate") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const baseQuery =
      session.user.role === "admin"
        ? {}
        : { participants: currentUser._id };

    const total = await Chat.countDocuments(baseQuery);
    const chats = await Chat.find(baseQuery)
      .populate("participants", "name email avatar preferredLanguage")
      .populate("lastMessage")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    if (paginate) {
      return NextResponse.json({
        data: chats,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUser._id, receiverId] },
    }).populate("participants", "name email avatar preferredLanguage");

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    const newChat = await Chat.create({
      participants: [currentUser._id, receiverId],
    });

    const populatedChat = await Chat.findById(newChat._id).populate(
      "participants",
      "name email avatar preferredLanguage"
    );

    return NextResponse.json(populatedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
