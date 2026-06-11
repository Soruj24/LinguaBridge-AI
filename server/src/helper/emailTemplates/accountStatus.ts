import { sendEmail, EmailResult } from "../email";

export const sendAccountStatusEmail = async (
  userEmail: string,
  userName: string,
  statusType: "banned" | "suspended" | "activated" | "deleted",
  reason?: string,
  duration?: string,
): Promise<EmailResult> => {
  const statusMessages = {
    banned: {
      subject: "🚫 Account Banned",
      color: "#ff4757",
      title: "Account Banned",
      message: "Your account has been permanently banned from our platform.",
    },
    suspended: {
      subject: "⏸️ Account Suspended",
      color: "#ffa502",
      title: "Account Suspended",
      message: `Your account has been temporarily suspended.${duration ? ` Duration: ${duration}` : ""}`,
    },
    activated: {
      subject: "✅ Account Reactivated",
      color: "#2ed573",
      title: "Account Reactivated",
      message:
        "Your account has been reactivated and you can now access all features.",
    },
    deleted: {
      subject: "🗑️ Account Deleted",
      color: "#576574",
      title: "Account Deleted",
      message: "Your account has been deleted as per your request.",
    },
  };

  const status = statusMessages[statusType];

  return sendEmail({
    to: userEmail,
    subject: status.subject,
    html: `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
        <div style="background: ${status.color}; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
          <strong>Account Status Update</strong>
        </div>

        <div style="margin-top: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
              <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                Hi ${userName}, we're writing to inform you about an important account update.
              </div>
              <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: ${status.color}; color: white; padding: 12px 16px; border-radius: 18px; max-width: 80%; margin-left: auto;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
                ${status.title}
              </div>
              <div style="font-size: 14px; line-height: 1.4; margin-bottom: 8px;">
                ${status.message}
              </div>
              ${
                reason
                  ? `
                <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 8px; margin: 8px 0; font-size: 13px;">
                  <strong>Reason:</strong> ${reason}
                </div>
              `
                  : ""
              }
              <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          ${
            statusType === "banned" || statusType === "suspended"
              ? `
            <div style="display: flex; align-items: start; margin-bottom: 15px;">
              <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                  <strong>Next Steps:</strong><br>
                  If you believe this is a mistake, you can appeal this decision.
                </div>
                <div style="margin-top: 10px;">
                  <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/support"
                     style="display: inline-block; background: ${status.color}; color: white; padding: 8px 16px; border-radius: 15px; text-decoration: none; font-size: 13px;">
                     📝 Appeal Decision
                  </a>
                </div>
                <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
          This is an automated message from our account management system.
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/help"
             style="color: ${status.color}; text-decoration: none; margin-left: 5px;">Help Center</a>
        </div>
      </div>
    `,
  });
};
