import { sendEmail, EmailResult } from "../email";

export const sendVerificationEmail = async (
  userEmail: string,
  userName: string,
  verificationToken: string,
): Promise<EmailResult> => {
  return sendEmail({
    to: userEmail,
    subject: `🔐 Verify Your Email`,
    html: `
            <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
                <div style="background: #ff6b6b; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
                    <strong>Security Verification</strong>
                </div>

                <div style="margin-top: 15px;">
                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                Hi ${userName}! Please verify your email to secure your account.
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #0084ff; color: white; padding: 15px; border-radius: 18px; max-width: 80%; margin-left: auto; text-align: center;">
                            <div style="font-size: 13px; margin-bottom: 10px;">Your verification code:</div>
                            <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px;">
                                ${verificationToken}
                            </div>
                            <div style="font-size: 11px; margin-top: 10px; opacity: 0.8;">
                                Expires in 24 hours
                            </div>
                            <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                Or click below to verify instantly:
                            </div>
                            <div style="margin-top: 10px;">
                                <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}"
                                   style="display: inline-block; background: #00a400; color: white; padding: 10px 20px; border-radius: 15px; text-decoration: none; font-size: 14px; font-weight: bold;">
                                   ✅ Verify Email
                                </a>
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
                    This is an automated message. Didn't request this? <a href="mailto:support@store.com" style="color: #0084ff; text-decoration: none;">Contact support</a>
                </div>
            </div>
        `,
  });
};
