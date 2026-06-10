import connectDB from "@/lib/db";
import Block from "@/models/Block";

export async function isBlocked(
  userId: string,
  otherUserId: string
): Promise<boolean> {
  if (!userId || !otherUserId) return false;
  await connectDB();
  const block = await Block.findOne({
    $or: [
      { blocker: userId, blocked: otherUserId },
      { blocker: otherUserId, blocked: userId },
    ],
  });
  return !!block;
}
