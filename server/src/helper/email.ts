import nodemailer from "nodemailer";
import { smtp_pass, smtp_user } from "../secret";

interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Validate email configuration on startup
const validateConfig = () => {
  if (!smtp_user || !smtp_pass) {
    throw new Error(
      "SMTP credentials are missing. Check your secret configuration.",
    );
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: smtp_user,
    pass: smtp_pass,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 20000,
  rateLimit: 5,
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP configuration error:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

export const sendEmail = async (emailData: EmailData): Promise<EmailResult> => {
  try {
    validateConfig();

    if (!emailData.to) {
      throw new Error("Recipient email address is required");
    }
    if (!emailData.subject) {
      throw new Error("Email subject is required");
    }
    if (!emailData.text && !emailData.html) {
      throw new Error("Either text or HTML content is required");
    }

    const info = await transporter.sendMail({
      from: `"Store Messenger" <${smtp_user}>`,
      ...emailData,
    });

    console.log(
      `✅ Email sent successfully to ${emailData.to}: ${info.messageId}`,
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ SMTP Error sending to ${emailData.to}:`, errorMessage);

    // Check for common Gmail errors to provide better feedback
    if (errorMessage.includes("535-5.7.8")) {
      console.error(
        "💡 TIP: This is an authentication error. Ensure your SMTP_PASS is a valid Google App Password and that 2FA is enabled on your account.",
      );
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export type { EmailResult };

export {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminToUserEmail,
  sendAccountStatusEmail,
  sendRoleChangeEmail,
} from "./emailTemplates/index";
