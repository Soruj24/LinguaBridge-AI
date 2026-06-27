import { Router, Request, Response } from "express";
import connectDB from "../config/connectDB";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import User from "../models/schemas/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../helper/email";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  await connectDB();

  const { name, email, password, preferredLanguage } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  let username = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!username) username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const existingUsername = await User.findOne({ username });
  if (existingUsername) username += Math.floor(1000 + Math.random() * 9000);

  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    preferredLanguage: preferredLanguage || "en",
    status: "pending",
    role: "user",
    emailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 86400000),
  });

  try {
    await sendVerificationEmail(user.email!, name, verificationToken);
  } catch (e) {
    console.error("Email sending error:", e);
  }

  res.status(201).json({ message: "Registration successful. Please check your email for verification.", userId: user._id });
});

export default router;
