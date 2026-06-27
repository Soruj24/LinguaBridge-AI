import type { SuspiciousActivityData } from "./securityNotificationTypes";
import type { EmailTemplate } from "./linguabridge";
import { getUnsubscribeFooter } from "./linguabridge";

export function getSuspiciousActivityTemplate(
  data: SuspiciousActivityData,
): EmailTemplate {
  const { name, reason, details, ipAddress, timestamp, email } = data;
  const formattedTime = timestamp.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const baseUrl = process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000";
  const unsubscribeFooter = getUnsubscribeFooter(baseUrl, email, "security");

  return {
    subject: `Security Alert: Suspicious Activity on Your LinguaBridge AI Account`,
    text: `Hello ${name},\n\nWe detected suspicious activity on your account:\n\nReason: ${reason}\nDetails: ${details}\nIP: ${ipAddress || "Unknown"}\nTime: ${formattedTime}\n\nPlease secure your account immediately.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #f44336; border-radius: 12px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #c62828; margin: 0 0 8px;">Security Alert</h1>
              <p style="color: #666; margin: 0;">LinguaBridge AI</p>
            </div>

            <p style="color: #333; line-height: 1.6; margin: 0 0 24px;">Hello ${name},</p>

            <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #c62828; margin: 0 0 12px;">Suspicious Activity Detected</h3>
              <p style="color: #333; font-weight: 500; margin: 0 0 8px;">${reason}</p>
              <p style="color: #666; font-size: 14px; margin: 0;">${details}</p>
            </div>

            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #666;">IP Address</span>
                <span style="color: #333; font-weight: 500;">${ipAddress || "Unknown"}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666;">Time</span>
                <span style="color: #333; font-weight: 500;">${formattedTime}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #333; font-weight: 500; margin-bottom: 16px;">To protect your account, please:</p>
              <ol style="text-align: left; color: #666; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Review your recent login activity</li>
                <li>Contact support if you have concerns</li>
              </ol>
              <a href="${baseUrl}/security" style="display: inline-block; padding: 14px 32px; background: #f44336; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Secure Account Now</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 24px; margin-top: 32px;">
              <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">If you did not notice any suspicious activity, you can safely ignore this email. However, we recommend reviewing your account security settings as a precaution.</p>
            </div>
            ${unsubscribeFooter}
          </div>
        </body>
      </html>
    `,
  };
}
