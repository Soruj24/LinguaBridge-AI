import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  preferredLanguage: z.string().min(2).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  preferences: z.object({
    lowBandwidth: z.boolean().optional(),
    reduceMotion: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    autoPlayAudio: z.boolean().optional(),
  }).optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, preferredLanguage, avatar, preferences } = updateSchema.parse(body);

    await connectDB();

    const updateData: any = {
      ...(name && { name }),
      ...(preferredLanguage && { preferredLanguage }),
      ...(avatar !== undefined && { avatar }),
    };

    if (preferences) {
        updateData.preferences = preferences;
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, upsert: false } // upsert: false because we are updating an existing user
    ).select("-password");

    return NextResponse.json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
