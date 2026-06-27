import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const token = "904d9ba0b429163d7d9f630a1bc1961f581c4c62cbbd93e84b3d32a945d82f01";
const verifyLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

try {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"LinguaBridge AI" <noreply@linguabridge.ai>',
    to: "nefewof314@brixozu.com",
    subject: "Verify your LinguaBridge AI account",
    text: `Hello,\n\nPlease verify your email by clicking the link: ${verifyLink}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, please ignore this email.`,
    html: `<p>Hello,</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>This link expires in 24 hours.</p><p>If you didn't request this, please ignore this email.</p>`,
  });
  console.log("Email sent:", info.messageId);
} catch (err) {
  console.error("Failed to send email:", err);
}
