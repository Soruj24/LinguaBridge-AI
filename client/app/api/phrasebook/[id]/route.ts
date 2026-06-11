import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PhrasebookEntry from "@/models/Phrasebook";
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
    const update: Record<string, unknown> = {};

    if (body.notes !== undefined) update.notes = body.notes;
    if (body.tags !== undefined) update.tags = body.tags;

    const entry = await PhrasebookEntry.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true }
    );

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error updating phrasebook entry:", error);
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

    const entry = await PhrasebookEntry.findOneAndDelete({ _id: id, userId });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting phrasebook entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
