import crypto from "crypto";

export const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function isTokenExpired(expires: Date | undefined): boolean {
  if (!expires) return true;
  return new Date() > expires;
}

export function isAccountLocked(lockUntil: Date | undefined): boolean {
  if (!lockUntil) return false;
  return new Date() < lockUntil;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getEmailVerificationTemplate(
  name: string,
  token: string,
  baseUrl: string
): EmailTemplate {
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  
  return {
    subject: "Verify your LinguaBridge AI account",
    text: `Hello ${name},\n\nPlease verify your email by clicking the link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, please ignore this email.`,
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
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7)); border-radius: 12px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">Verify Your Email</h1>
              <p style="color: #666; margin: 0;">LinguaBridge AI</p>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin: 0 0 24px;">Hello ${name},</p>
            <p style="color: #333; line-height: 1.6; margin: 0 0 24px;">Thanks for signing up! Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8)); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Verify Email Address</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">Or copy and paste this link in your browser:</p>
            <p style="color: hsl(var(--primary)); font-size: 13px; word-break: break-all; margin: 0 0 24px;">${verificationUrl}</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">This link expires in <strong>24 hours</strong>.</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 24px; margin-top: 32px;">
              <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">If you didn't create an account with LinguaBridge AI, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getPasswordResetTemplate(
  name: string,
  token: string,
  baseUrl: string
): EmailTemplate {
  const resetUrl = `${baseUrl}/api/auth/reset-password?token=${token}`;
  
  return {
    subject: "Reset your LinguaBridge AI password",
    text: `Hello ${name},\n\nYou requested a password reset. Click the link to set a new password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
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
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7)); border-radius: 12px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">Reset Password</h1>
              <p style="color: #666; margin: 0;">LinguaBridge AI</p>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin: 0 0 24px;">Hello ${name},</p>
            <p style="color: #333; line-height: 1.6; margin: 0 0 24px;">Someone requested a password reset for your account. Click the button below to set a new password:</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8)); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Reset Password</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">Or copy and paste this link in your browser:</p>
            <p style="color: hsl(var(--primary)); font-size: 13px; word-break: break-all; margin: 0 0 24px;">${resetUrl}</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">This link expires in <strong>1 hour</strong>.</p>
            
            <div style="background: #fef3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;"><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password won't be changed.</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 24px; margin-top: 32px;">
              <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">This is an automated security message from LinguaBridge AI.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}