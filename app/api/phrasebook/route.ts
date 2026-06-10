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

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const language = searchParams.get("language") || "";

    const filter: Record<string, unknown> = { userId };

    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        $or: [
          { originalText: { $regex: search, $options: "i" } },
          { translatedText: { $regex: search, $options: "i" } },
          { notes: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (language) {
      conditions.push({
        $or: [{ languageFrom: language }, { languageTo: language }],
      });
    }

    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$and = conditions;
    }

    const entries = await PhrasebookEntry.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching phrasebook entries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { originalText, translatedText, languageFrom, languageTo, sourceMessageId, sourceChatId } = body;

    if (!originalText || !translatedText || !languageFrom || !languageTo) {
      return NextResponse.json(
        { error: "originalText, translatedText, languageFrom, and languageTo are required" },
        { status: 400 }
      );
    }

    const entry = await PhrasebookEntry.create({
      userId,
      originalText,
      translatedText,
      languageFrom,
      languageTo,
      sourceMessageId: sourceMessageId || null,
      sourceChatId: sourceChatId || null,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error saving phrasebook entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
