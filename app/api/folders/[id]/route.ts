import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Folder from "@/models/Folder";
import Chat from "@/models/Chat";
import User from "@/models/User";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  return user?._id;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "reorder") {
      const { folderIds } = body;
      if (!Array.isArray(folderIds)) {
        return NextResponse.json({ error: "folderIds array is required" }, { status: 400 });
      }
      const bulkOps = folderIds.map((fid: string, index: number) => ({
        updateOne: {
          filter: { _id: fid, userId },
          update: { $set: { order: index } },
        },
      }));
      await Folder.bulkWrite(bulkOps);
      return NextResponse.json({ success: true });
    }

    const update: Record<string, string> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.color !== undefined) update.color = body.color;

    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true }
    );

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folder = await Folder.findOneAndDelete({ _id: id, userId });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    await Chat.updateMany(
      { folderId: id, participants: userId },
      { $set: { folderId: null } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
