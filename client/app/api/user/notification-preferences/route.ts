import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const ALLOWED_TYPES = ["messages", "friend_requests", "group_invites", "calls", "security_alerts", "system_updates"] as const;
const ALLOWED_SOUNDS = ["default", "chime", "bell", "none"] as const;

const updateSchema = z.object({
  enabledTypes: z.array(z.enum(ALLOWED_TYPES)).optional(),
  doNotDisturb: z
    .object({
      enabled: z.boolean().optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    })
    .optional(),
  sound: z.enum(ALLOWED_SOUNDS).optional(),
  vibration: z.boolean().optional(),
  showPreview: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select("notificationPreferences");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      enabledTypes: user.notificationPreferences?.enabledTypes ?? [
        "messages", "friend_requests", "group_invites", "calls", "security_alerts", "system_updates",
      ],
      doNotDisturb: user.notificationPreferences?.doNotDisturb ?? {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
      },
      sound: user.notificationPreferences?.sound ?? "default",
      vibration: user.notificationPreferences?.vibration ?? true,
      showPreview: user.notificationPreferences?.showPreview ?? true,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.parse(body);

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (parsed.enabledTypes !== undefined) updateData["notificationPreferences.enabledTypes"] = parsed.enabledTypes;
    if (parsed.doNotDisturb !== undefined) {
      if (parsed.doNotDisturb.enabled !== undefined) updateData["notificationPreferences.doNotDisturb.enabled"] = parsed.doNotDisturb.enabled;
      if (parsed.doNotDisturb.startTime !== undefined) updateData["notificationPreferences.doNotDisturb.startTime"] = parsed.doNotDisturb.startTime;
      if (parsed.doNotDisturb.endTime !== undefined) updateData["notificationPreferences.doNotDisturb.endTime"] = parsed.doNotDisturb.endTime;
    }
    if (parsed.sound !== undefined) updateData["notificationPreferences.sound"] = parsed.sound;
    if (parsed.vibration !== undefined) updateData["notificationPreferences.vibration"] = parsed.vibration;
    if (parsed.showPreview !== undefined) updateData["notificationPreferences.showPreview"] = parsed.showPreview;

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true },
    ).select("notificationPreferences");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      enabledTypes: user.notificationPreferences?.enabledTypes ?? [],
      doNotDisturb: user.notificationPreferences?.doNotDisturb ?? { enabled: false, startTime: "22:00", endTime: "08:00" },
      sound: user.notificationPreferences?.sound ?? "default",
      vibration: user.notificationPreferences?.vibration ?? true,
      showPreview: user.notificationPreferences?.showPreview ?? true,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
