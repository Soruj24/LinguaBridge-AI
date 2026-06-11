import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Friendship from "@/models/Friendship";

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  return lines.map(parseLine);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV file is empty or has no data rows" },
        { status: 400 },
      );
    }

    const headers = rows[0].map((h) => h.toLowerCase());
    const emailIdx = headers.indexOf("email");
    if (emailIdx === -1) {
      return NextResponse.json(
        { error: "CSV must contain an 'email' column" },
        { status: 400 },
      );
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const email = dataRows[i][emailIdx]?.trim().toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      const user = await User.findOne({ email });
      if (!user) {
        skipped++;
        errors.push(
          `Row ${i + 2}: No user found for email "${email}"`,
        );
        continue;
      }

      if (user._id.toString() === currentUser._id.toString()) {
        skipped++;
        continue;
      }

      const existing = await Friendship.findOne({
        $or: [
          { requester: currentUser._id, recipient: user._id },
          { requester: user._id, recipient: currentUser._id },
        ],
      });

      if (existing && existing.status === "accepted") {
        skipped++;
        continue;
      }

      if (existing && existing.status === "pending") {
        skipped++;
        continue;
      }

      if (existing && existing.status === "rejected") {
        existing.status = "pending";
        existing.requester = currentUser._id;
        existing.recipient = user._id;
        await existing.save();
        imported++;
        continue;
      }

      await Friendship.create({
        requester: currentUser._id,
        recipient: user._id,
        status: "pending",
      });
      imported++;
    }

    return NextResponse.json({
      total: dataRows.length,
      imported,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
