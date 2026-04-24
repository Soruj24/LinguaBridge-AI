import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}