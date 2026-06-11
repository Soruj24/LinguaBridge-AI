import { sendEmail, EmailResult } from "../email";

export const sendAdminToUserEmail = async (
  adminName: string,
  adminEmail: string,
  userEmail: string,
  userName: string,
  subject: string,
  message: string,
): Promise<EmailResult> => {
  return sendEmail({
    to: userEmail,
    cc: adminEmail,
    subject: `📨 ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
        <div style="background: #6c5ce7; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
          <strong>Administrator Message</strong>
        </div>

        <div style="margin-top: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
              <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                Hi ${userName}! You have received a message from the administrator.
              </div>
              <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #6c5ce7; color: white; padding: 12px 16px; border-radius: 18px; max-width: 80%; margin-left: auto;">
              <div style="font-size: 14px; line-height: 1.4; margin-bottom: 5px;">
                <strong>From:</strong> ${adminName}
              </div>
              <div style="font-size: 14px; line-height: 1.4; margin-bottom: 5px;">
                <strong>Subject:</strong> ${subject}
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; margin: 10px 0; font-size: 13px; line-height: 1.5;">
                ${message.replace(/\n/g, "<br>")}
              </div>
              <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
              <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                <strong>How to reply?</strong><br>
                You can reply directly to this email or contact support if needed.
              </div>
              <div style="margin-top: 10px;">
                <a href="mailto:${adminEmail}"
                   style="display: inline-block; background: #00b894; color: white; padding: 8px 16px; border-radius: 15px; text-decoration: none; font-size: 13px;">
                   📧 Reply to Admin
                </a>
              </div>
              <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
          This is an official message from the administration team.
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/support"
             style="color: #6c5ce7; text-decoration: none; margin-left: 5px;">Contact Support</a>
        </div>
      </div>
    `,
  });
};
