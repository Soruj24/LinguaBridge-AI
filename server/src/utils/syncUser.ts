import connectDB from "../config/connectDB";
import { ChatUser } from "../models/chat";

export async function findOrCreateChatUser({
  email,
  name,
  avatar,
  preferredLanguage,
}: {
  email: string;
  name?: string;
  avatar?: string;
  preferredLanguage?: string;
}) {
  await connectDB();

  let user = await ChatUser.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await ChatUser.create({
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      avatar: avatar || undefined,
      preferredLanguage: preferredLanguage || "en",
      isEmailVerified: true,
      isActive: true,
    });
  } else {
    const updates: Record<string, unknown> = {};
    if (name && name !== user.name) updates.name = name;
    if (avatar && avatar !== user.avatar) updates.avatar = avatar;
    if (preferredLanguage && preferredLanguage !== user.preferredLanguage)
      updates.preferredLanguage = preferredLanguage;
    if (Object.keys(updates).length > 0) {
      await ChatUser.findByIdAndUpdate(user._id, updates);
      user = await ChatUser.findById(user._id);
    }
  }

  return user;
}
