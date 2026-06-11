import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import type { PipelineStage } from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const limit = Math.max(
      1,
      Math.min(50, Number(url.searchParams.get("limit")) || 12),
    );

    const pipeline: PipelineStage[] = [
      { $match: { languageTo: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$languageTo",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as const } },
      { $limit: limit },
    ];

    const results = await Message.aggregate(pipeline);
    const data = results.map((r: { _id: string; count: number }) => ({
      code: r._id,
      count: r.count,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Language usage analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
