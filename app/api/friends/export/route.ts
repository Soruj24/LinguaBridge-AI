import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";

export async function GET(req: NextRequest) {
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

    const friends = friendships.map((f) => {
      const isRequester =
        f.requester._id.toString() === currentUser._id.toString();
      const friend = isRequester ? f.recipient : f.requester;
      return {
        name: friend.name,
        email: friend.email,
        preferredLanguage: friend.preferredLanguage,
        createdAt: f.createdAt,
      };
    });

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    if (format === "csv") {
      const headers = ["Name", "Email", "Language", "Added Date"];
      const rows = friends.map((f) => [
        `"${f.name.replace(/"/g, '""')}"`,
        `"${f.email.replace(/"/g, '""')}"`,
        f.preferredLanguage,
        new Date(f.createdAt).toISOString().split("T")[0],
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\r\n",
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="contacts.csv"',
        },
      });
    }

    return NextResponse.json(
      { friends },
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="contacts.json"',
        },
      },
    );
  } catch (error) {
    console.error("Error exporting friends:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
