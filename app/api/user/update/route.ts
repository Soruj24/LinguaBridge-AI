import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  preferredLanguage: z.string().min(2).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z.boolean().optional(),
  targetUserId: z.string().optional(),
  targetEmail: z.string().email().optional(),
  deleteUser: z.boolean().optional(),
  preferences: z
    .object({
      lowBandwidth: z.boolean().optional(),
      reduceMotion: z.boolean().optional(),
      highContrast: z.boolean().optional(),
      autoPlayAudio: z.boolean().optional(),
    })
    .optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      preferredLanguage,
      avatar,
      role,
      isActive,
      targetUserId,
      targetEmail,
      deleteUser,
      preferences,
    } =
      updateSchema.parse(body);

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (avatar !== undefined) updateData.avatar = avatar;
    // Only admin can change role
    const isAdmin = session.user.role === "admin";
    if (isAdmin && role) {
      updateData.role = role;
    }
    if (isAdmin && typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (preferences) {
      // Use dot notation to update specific preference fields without overwriting the whole object
      if (preferences.lowBandwidth !== undefined)
        updateData["preferences.lowBandwidth"] = preferences.lowBandwidth;
      if (preferences.reduceMotion !== undefined)
        updateData["preferences.reduceMotion"] = preferences.reduceMotion;
      if (preferences.highContrast !== undefined)
        updateData["preferences.highContrast"] = preferences.highContrast;
      if (preferences.autoPlayAudio !== undefined)
        updateData["preferences.autoPlayAudio"] = preferences.autoPlayAudio;
    }

    // Determine target user: admin may update others; regular users update self
    const filter =
      isAdmin && (targetUserId || targetEmail)
        ? targetUserId
          ? { _id: targetUserId }
          : { email: targetEmail as string }
        : { email: session.user.email };

    if (isAdmin && deleteUser) {
      const target = await User.findOne(filter);
      if (!target) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const targetId = target._id.toString();
      await Message.deleteMany({
        $or: [{ senderId: targetId }, { receiverId: targetId }],
      });
      await Chat.deleteMany({ participants: targetId });
      await User.deleteOne({ _id: targetId });
      return NextResponse.json({ success: true });
    } else {
      const user = await User.findOneAndUpdate(
        filter,
        { $set: updateData },
        { new: true, upsert: false },
      ).select("-password");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
