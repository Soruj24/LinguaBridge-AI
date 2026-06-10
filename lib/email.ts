import nodemailer from "nodemailer";
import connectDB from "./db";
import User from "@/models/User";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

type EmailType = "marketing" | "security";

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (process.env.NODE_ENV === "development" && process.env.EMAIL_MOCK === "true") {
    console.log("📧 [MOCK EMAIL]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"LinguaBridge AI" <noreply@linguabridge.ai>',
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendEmailWithPreferenceCheck(
  { to, subject, html, text }: SendEmailOptions,
  type: EmailType
): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ email: to }).select("emailPreferences");
    if (!user) {
      console.warn(`User not found for email: ${to}. Skipping.`);
      return false;
    }
    const prefs = user.emailPreferences || { marketing: true, security: true };
    if (!prefs[type]) {
      console.log(`📧 [SKIPPED] User unsubscribed from ${type} emails. To: ${to}`);
      return false;
    }
    return await sendEmail({ to, subject, html, text });
  } catch (error) {
    console.error("Failed to send email with preference check:", error);
    return false;
  }
}