import connectDB from "../../config/connectDB";
import { ChatUser } from "../../models/chat";

export async function getUser(email: string) {
  try {
    await connectDB();
    return await ChatUser.findOne({ email });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function getOrCreateUser({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  await connectDB();

  let user = await ChatUser.findOne({ email });

  if (!user) {
    user = await ChatUser.create({
      name: name || "User",
      email,
      avatar: image,
      isEmailVerified: true,
      isActive: true,
      loginAttempts: 0,
    });
  } else if (image && !user.avatar) {
    user.avatar = image;
    await user.save();
  }

  return user;
}
