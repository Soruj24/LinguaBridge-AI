import { sendEmail, EmailResult } from "../email";

export const sendRoleChangeEmail = async (
  userEmail: string,
  userName: string,
  oldRole: string,
  newRole: string,
  changedBy: string,
): Promise<EmailResult> => {
  const roleColors: Record<string, string> = {
    user: "#74b9ff",
    moderator: "#00b894",
    admin: "#6c5ce7",
    super_admin: "#fd79a8",
  };

  return sendEmail({
    to: userEmail,
    subject: "👑 Your Role Has Been Updated",
    html: `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
        <div style="background: #fdcb6e; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
          <strong>Role Update Notification</strong>
        </div>

        <div style="margin-top: 15px;">
          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
              <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                Hi ${userName}! Your account role has been updated by an administrator.
              </div>
              <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #fdcb6e; color: white; padding: 12px 16px; border-radius: 18px; max-width: 80%; margin-left: auto;">
              <div style="display: flex; align-items: center; margin-bottom: 10px; gap: 10px;">
                <div style="background: ${roleColors[oldRole] || "#74b9ff"}; padding: 6px 12px; border-radius: 10px; font-size: 12px;">
                  ${oldRole.toUpperCase()}
                </div>
                <div style="font-size: 18px;">→</div>
                <div style="background: ${roleColors[newRole] || "#00b894"}; padding: 6px 12px; border-radius: 10px; font-size: 12px;">
                  ${newRole.toUpperCase()}
                </div>
              </div>
              <div style="font-size: 13px; margin-bottom: 5px;">
                <strong>Changed by:</strong> ${changedBy}
              </div>
              <div style="font-size: 13px;">
                <strong>Effective immediately</strong>
              </div>
              <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
              <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                <strong>What this means:</strong><br>
                Your permissions and access levels have been updated accordingly.
              </div>
              <div style="margin-top: 10px;">
                <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/profile"
                   style="display: inline-block; background: #fdcb6e; color: white; padding: 8px 16px; border-radius: 15px; text-decoration: none; font-size: 13px;">
                   👤 View Your Profile
                </a>
              </div>
              <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
          This change was made by an authorized administrator.
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/help/permissions"
             style="color: #fdcb6e; text-decoration: none; margin-left: 5px;">Learn about roles</a>
        </div>
      </div>
    `,
  });
};
