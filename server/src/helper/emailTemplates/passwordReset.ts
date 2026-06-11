import { sendEmail, EmailResult } from "../email";

export const sendPasswordResetEmail = async (
  userEmail: string,
  userName: string,
  resetToken: string,
): Promise<EmailResult> => {
  return sendEmail({
    to: userEmail,
    subject: `🔑 Reset Your Password`,
    html: `
            <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
                <div style="background: #ff6b6b; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
                    <strong>Password Reset</strong>
                </div>

                <div style="margin-top: 15px;">
                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                Hi ${userName}! We received a request to reset your password.
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #0084ff; color: white; padding: 12px 16px; border-radius: 18px; max-width: 80%; margin-left: auto;">
                            <div style="font-size: 14px; line-height: 1.4;">
                                Click below to reset your password:
                            </div>
                            <div style="margin-top: 10px; text-align: center;">
                                <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}"
                                   style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 15px; text-decoration: none; font-size: 14px; font-weight: bold;">
                                   🔑 Reset Password
                                </a>
                            </div>
                            <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                <strong>Note:</strong> This link expires in 1 hour. If you didn't request this, please ignore this message.
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
                    This is an automated message. Need help? <a href="mailto:support@store.com" style="color: #0084ff; text-decoration: none;">Contact support</a>
                </div>
            </div>
        `,
  });
};
